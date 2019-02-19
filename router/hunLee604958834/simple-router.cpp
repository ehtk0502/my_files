/* -*- Mode:C++; c-file-style:"gnu"; indent-tabs-mode:nil; -*- */
/**
 * Copyright (c) 2017 Alexander Afanasyev
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation, either version
 * 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <http://www.gnu.org/licenses/>.
 */

#include "simple-router.hpp"
#include "core/utils.hpp"

#include <fstream>

namespace simple_router {

//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
// IMPLEMENT THIS METHOD
void
SimpleRouter::handlePacket(const Buffer& packet, const std::string& inIface)
{
  std::cerr << "Got packet of size " << packet.size() << " on interface " << inIface << std::endl;
  /////
  //fprintf(stderr, "start debugging\n");
  //print_hdrs(packet);
  //////
  const Interface* iface = findIfaceByName(inIface);
  if (iface == nullptr) {
    std::cerr << "Received packet, but interface is unknown, ignoring" << std::endl;
    return;
  }
  
  std::cerr << getRoutingTable() << std::endl;
    
  size_t minlength = sizeof(ethernet_hdr);
  if (packet.size() < minlength) {
    fprintf(stderr, "Failed to load ETHERNET header, insufficient length\n");
    return;
  }
  
  const ethernet_hdr *ehdr = (const ethernet_hdr *)packet.data();
  uint16_t ethType= ntohs(ehdr->ether_type);
  const uint8_t* Eaddr = ehdr->ether_dhost;
  
  Buffer TargetAddr(Eaddr, Eaddr + sizeof(Eaddr) / sizeof(Eaddr[0]));
  Buffer BroadAddr(BroadcastEtherAddr, BroadcastEtherAddr + sizeof(BroadcastEtherAddr)/ sizeof(BroadcastEtherAddr[0]));
  
  if(macToString(TargetAddr) == macToString(BroadAddr) || macToString(TargetAddr) == macToString(iface->addr)){
    if (ethType == ethertype_arp){//arp
    
        unsigned int requiredize = minlength + sizeof(arp_hdr);
        if (packet.size() < requiredize){
            fprintf(stderr, "Failed to load ARP header, insufficient length\n");
        }
        const arp_hdr* m_ArpHdr = reinterpret_cast<const arp_hdr*>(packet.data() + sizeof(ethernet_hdr));
        unsigned short opArp = ntohs(m_ArpHdr->arp_op);
        
        if(opArp == arp_op_request){
            if(m_ArpHdr->arp_tip == iface->ip){
                
            /////////////////
            //fprintf(stderr, "arp request recieved\n");
            //////////////////////////////
                
                Buffer FillPacket(requiredize);
                ethernet_hdr* etherFill= (ethernet_hdr *)FillPacket.data();
                arp_hdr* arpFill = reinterpret_cast<arp_hdr*>(FillPacket.data() + sizeof(ethernet_hdr));
                
                memcpy(etherFill->ether_dhost, ehdr->ether_shost, ETHER_ADDR_LEN);
                memcpy(etherFill->ether_shost, iface->addr.data(), ETHER_ADDR_LEN);
                etherFill->ether_type = htons(ethertype_arp);
                
                arpFill->arp_hrd = htons(arp_hrd_ethernet);
                arpFill->arp_pro = htons(ethertype_ip);
                arpFill->arp_hln = 0x06;
                arpFill->arp_pln = 0x04;
                arpFill->arp_op = htons(arp_op_reply);
                memcpy(arpFill->arp_sha, iface->addr.data(), ETHER_ADDR_LEN);
                arpFill->arp_sip = iface->ip;
                memcpy(arpFill->arp_tha, ehdr->ether_shost, ETHER_ADDR_LEN);
                arpFill->arp_tip = m_ArpHdr->arp_sip;
                
                //print_hdrs(FillPacket);
                //std::cerr<<   inIface << std::endl;
                sendPacket(FillPacket,inIface);
                
                
            //fprintf(stderr, "arp request finished\n");
                return;
            }
            else{
                return;
            }
        }
        else if(opArp == arp_op_reply){
            const unsigned char* mcTarget = m_ArpHdr->arp_tha;
            Buffer CheckMcAddr(mcTarget, mcTarget + sizeof(mcTarget) / sizeof(mcTarget[0]));
            
            /////////////////
            //fprintf(stderr, "arp reply recieved\n");
            //////////////////////////////
            if(macToString(CheckMcAddr) == macToString(iface->addr)){
                //fprintf(stderr, "arp reply recieved\n1111111111111111111111111\n");
                const uint32_t IPtoMap = m_ArpHdr->arp_sip;
                const uint8_t* MacToMap = m_ArpHdr->arp_sha;
                Buffer bufferedMac(MacToMap, MacToMap + sizeof(MacToMap) / sizeof(MacToMap[0]));
                
                
                std::shared_ptr<ArpRequest> m_ArpReqEntry = m_arp.insertArpEntry(bufferedMac, IPtoMap);
                
                if(m_ArpReqEntry != nullptr){
                    //fprintf(stderr, "yess in here1111111111111111111\n");
                    std::list<PendingPacket> packetsToSend = m_ArpReqEntry->packets;
                    for(std::list<PendingPacket>::iterator it = packetsToSend.begin(); it != packetsToSend.end(); it++){
                        
                        ethernet_hdr *tempEhdr = (ethernet_hdr *)it->packet.data();
                        ip_hdr* tempIphdr = (ip_hdr *)(it->packet.data() + sizeof(ethernet_hdr));
                        
                        memcpy(tempEhdr->ether_dhost, m_ArpHdr->arp_sha, ETHER_ADDR_LEN);
                        memcpy(tempEhdr->ether_shost, iface->addr.data(), ETHER_ADDR_LEN);
                        tempIphdr->ip_ttl = tempIphdr->ip_ttl - 1;
                        tempIphdr->ip_sum = 0;
                        tempIphdr->ip_sum = cksum(tempIphdr, sizeof(ip_hdr));
                        
                        sendPacket(it->packet, it->iface);
                        //std::cerr<< it->iface << std::endl;
                        //print_hdrs(it->packet);
                        
                    }
                    
                    m_arp.removeRequest(m_ArpReqEntry);
                    
                    //fprintf(stderr, "arp reply finished\n");
                    return;
                }
                else{
                    return;
                }
            }
            else{
                return;
            }
        }
        else{
            return;
        }
    }
    else if(ethType == ethertype_ip){//ivp4
        minlength += sizeof(ip_hdr);
        //fprintf(stderr, "IP packet recieved\n");
        if (packet.size() < minlength) {
            fprintf(stderr, "Failed to load IP header, insufficient length\n");
            return;
        }
        
        ip_hdr* m_iphdr = (ip_hdr *)(packet.data() + sizeof(ethernet_hdr));
        if(m_iphdr->ip_ttl <= 0){
            return;
        }
        
        ip_hdr PassToCkSum;
        memcpy(&PassToCkSum, m_iphdr, sizeof(ip_hdr));
        PassToCkSum.ip_sum = 0;
        
        //fprintf(stderr, "checksum test\n");
        if(m_iphdr->ip_sum == cksum(&PassToCkSum, sizeof(ip_hdr))){
            //fprintf(stderr, "checksum goes through\n");
            uint32_t destIP = m_iphdr->ip_dst;
                
            try{
                RoutingTableEntry m_Table = m_routingTable.lookup(destIP);
                const Interface* ForwardHere = findIfaceByName(m_Table.ifName);
                std::shared_ptr<ArpEntry> m_ArpCachEntry = m_arp.lookup(m_Table.gw);
                    
                if(m_ArpCachEntry == nullptr){
                /////////////////
                   // fprintf(stderr, "IP doesnt have IP - Mac Mapping\n");
                //////////////////////////////
                    Buffer FillPacket(sizeof(ethernet_hdr) + sizeof(arp_hdr));
                    ethernet_hdr* etherFill= (ethernet_hdr *)FillPacket.data();
                    arp_hdr* arpFill = reinterpret_cast<arp_hdr*>(FillPacket.data() + sizeof(ethernet_hdr));
                        
                    memcpy(etherFill->ether_dhost, BroadcastEtherAddr, ETHER_ADDR_LEN);
                    memcpy(etherFill->ether_shost, ForwardHere->addr.data(), ETHER_ADDR_LEN);
                    etherFill->ether_type = htons(ethertype_arp);
                        
                    arpFill->arp_hrd = htons(arp_hrd_ethernet);
                    arpFill->arp_pro = htons(ethertype_ip);
                    arpFill->arp_hln = 0x06;
                    arpFill->arp_pln = 0x04;
                    arpFill->arp_op = htons(arp_op_request);
                    memcpy(arpFill->arp_sha, ForwardHere->addr.data(), ETHER_ADDR_LEN);
                    arpFill->arp_sip = ForwardHere->ip;
                    
                    static const uint8_t AllZero[ETHER_ADDR_LEN] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};
                    memcpy(arpFill->arp_tha, AllZero, ETHER_ADDR_LEN);
                            ///
                    arpFill->arp_tip = m_Table.gw;
                    
                    sendPacket(FillPacket, m_Table.ifName);
                    //std::cerr<<   m_Table.ifName << std::endl;
                    //fprintf(stderr, "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww\n");
                    m_arp.queueRequest(m_Table.gw, packet, m_Table.ifName);
                    //print_hdrs(FillPacket);
                    
                    //fprintf(stderr, "IP doesnt have IP - Mac Mapping finished\n");
                    return;
                
                }
                else{
                    //Buffer macInCache = m_ArpCachEntry->mac;
                    /////////////////
                    //fprintf(stderr, "IP has IP - Mac Mapping\n");
                    /////////////////////////////
                    Buffer copyPacket(packet);
                        
                    ethernet_hdr *tempEhdr = (ethernet_hdr *)copyPacket.data();
                    ip_hdr* tempIphdr = (ip_hdr *)(copyPacket.data() + sizeof(ethernet_hdr));
                        
                    memcpy(tempEhdr->ether_dhost, m_ArpCachEntry->mac.data(), ETHER_ADDR_LEN);
                    memcpy(tempEhdr->ether_shost, ForwardHere->addr.data(), ETHER_ADDR_LEN);
                    tempIphdr->ip_ttl = tempIphdr->ip_ttl - 1;
                    tempIphdr->ip_sum = 0;
                    tempIphdr->ip_sum = cksum(tempIphdr, sizeof(ip_hdr));
            
                    sendPacket(copyPacket, m_Table.ifName);
                    
                    //print_hdrs(copyPacket);
                    //std::cerr<<  m_Table.ifName << std::endl;
                    
                    //fprintf(stderr, "IP has IP - Mac Mapping finished\n");
                    return;
                }
                    
                }
                catch(const std::runtime_error& e){
                    return;
                }
            
        }
        else{
            return;
        }
        
    }
    else{
        return;
    }
  }
  else{
    return;
  }
  
}
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////

// You should not need to touch the rest of this code.
SimpleRouter::SimpleRouter()
  : m_arp(*this)
{
}

void
SimpleRouter::sendPacket(const Buffer& packet, const std::string& outIface)
{
  m_pox->begin_sendPacket(packet, outIface);
}

bool
SimpleRouter::loadRoutingTable(const std::string& rtConfig)
{
  return m_routingTable.load(rtConfig);
}

void
SimpleRouter::loadIfconfig(const std::string& ifconfig)
{
  std::ifstream iff(ifconfig.c_str());
  std::string line;
  while (std::getline(iff, line)) {
    std::istringstream ifLine(line);
    std::string iface, ip;
    ifLine >> iface >> ip;

    in_addr ip_addr;
    if (inet_aton(ip.c_str(), &ip_addr) == 0) {
      throw std::runtime_error("Invalid IP address `" + ip + "` for interface `" + iface + "`");
    }

    m_ifNameToIpMap[iface] = ip_addr.s_addr;
  }
}

void
SimpleRouter::printIfaces(std::ostream& os)
{
  if (m_ifaces.empty()) {
    os << " Interface list empty " << std::endl;
    return;
  }

  for (const auto& iface : m_ifaces) {
    os << iface << "\n";
  }
  os.flush();
}

const Interface*
SimpleRouter::findIfaceByIp(uint32_t ip) const
{
  auto iface = std::find_if(m_ifaces.begin(), m_ifaces.end(), [ip] (const Interface& iface) {
      return iface.ip == ip;
    });

  if (iface == m_ifaces.end()) {
    return nullptr;
  }

  return &*iface;
}

const Interface*
SimpleRouter::findIfaceByMac(const Buffer& mac) const
{
  auto iface = std::find_if(m_ifaces.begin(), m_ifaces.end(), [mac] (const Interface& iface) {
      return iface.addr == mac;
    });

  if (iface == m_ifaces.end()) {
    return nullptr;
  }

  return &*iface;
}

const Interface*
SimpleRouter::findIfaceByName(const std::string& name) const
{
  auto iface = std::find_if(m_ifaces.begin(), m_ifaces.end(), [name] (const Interface& iface) {
      return iface.name == name;
    });

  if (iface == m_ifaces.end()) {
    return nullptr;
  }

  return &*iface;
}

void
SimpleRouter::reset(const pox::Ifaces& ports)
{
  std::cerr << "Resetting SimpleRouter with " << ports.size() << " ports" << std::endl;

  m_arp.clear();
  m_ifaces.clear();

  for (const auto& iface : ports) {
    auto ip = m_ifNameToIpMap.find(iface.name);
    if (ip == m_ifNameToIpMap.end()) {
      std::cerr << "IP_CONFIG missing information about interface `" + iface.name + "`. Skipping it" << std::endl;
      continue;
    }

    m_ifaces.insert(Interface(iface.name, iface.mac, ip->second));
  }

  printIfaces(std::cerr);
}


} // namespace simple_router {
