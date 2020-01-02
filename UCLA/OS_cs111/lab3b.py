#!/usr/bin/python
import sys
import csv



class superblock:
	def __init__(self, row):
		self.tBlockNum = int(row[1])
		self.tNodeNum = int(row[2])
		self.blockSize = int(row[3])
		self.nodeSize = int(row[4])
		self.blockPerGroup = int(row[5])
		self.nodePerGroup = int(row[6])
		self.nonReservedNode = int(row[7])

class group:
	def __init__(self, row):
		self.groupNum = int(row[1])
		self.tBlockGroup = int(row[2])
		self.tNodeGroup = int(row[3])
		self.freeBlockNum = int(row[4])
		self.freeNodeNum = int(row[5])
		self.bitmapBlockNum = int(row[6])
		self.bitmapNodeNum = int(row[7])
		self.firstInodeBlock = int(row[8])

class inode:
	def __init__(self, row):
		self.nodeNum = int(row[1])
		self.fileType = row[2]
		self.mode = int(row[3])
		self.owner = int(row[4])
		self.group = int(row[5])
		self.linkCount = int(row[6])
		self.timeChange = row[7]
		self.timeModified = row[8]
		self.timeAccessed = row[9]
		self.fileSize = int(row[10])
		self.numBlockDisk = int(row[11])
		self.directBlock = [int(row[12]), int(row[13]), int(row[14]), int(row[15]), int(row[16]), int(row[17]), int(row[18]), int(row[19]), int(row[20]), int(row[21]), int(row[22]), int(row[23])]
		self.singleInd = int(row[24])
		self.doubleInd = int(row[25])
		self.tripleInd = int(row[26])

		
class dirent:
	def __init__(self, row):
		self.parentNodeNum = int(row[1])
		self.byteOffset = int(row[2])
		self.referencedFileNum = int(row[3])
		self.entryLength = int(row[4])
		self.nameLength = int(row[5])
		self.nameStr = row[6]

class indirect:
	def __init__(self, row):
		self.owningNodeNum = int(row[1])
		self.indirectLevel = int(row[2])
		self.blockOffSet = int(row[3])
		self.blockScanned = int(row[4])
		self.referencedBlockNumber = int(row[5])
	

def main():
	if len(sys.argv) != 2:
		sys.stderr.write("invalid input number\n")
		sys.exit(1)
	try:
		readFile = open(sys.argv[1], 'r')
	except IOError:
		sys.stderr.write("reading failure\n")
	
	dataRead = csv.reader(readFile);
	
	exitFlag = False;
	
	ifree = []
	bfree = []
	inodeList = []
	inode_array = []
	direntList = []
	indirectList = []
	indirect_array = []
	
	for row in dataRead:
		if row[0] == "SUPERBLOCK":
			Superblock = superblock(row)
		elif row[0] == "GROUP":
			groupData = group(row)
		elif row[0] == "INODE":
			inodeList.append(inode(row))
			inode_array.append(row)
		elif row[0] == "BFREE":
			bfree.append(int(row[1]))
		elif row[0] == "IFREE":
			ifree.append(int(row[1]))
		elif row[0] == "DIRENT":
			direntList.append(dirent(row))
		elif row[0] == "INDIRECT":
			indirectList.append(indirect(row))
			indirect_array.append(row)


###block part ###
	
	node_referenced = []
	inode_reference = []
	offset_referenced = []
	indirect_referenced_level = []

	for nodeTraverse in inode_array:
		offset = 0
		for block_address in nodeTraverse[12:24]:
			if int(block_address) < 0:
				print("INVALID BLOCK " + str(block_address) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(offset) )
			offset = offset + 1


		if (int(nodeTraverse[24]) < 0):
			print("INVALID INDIRECT BLOCK " + str(nodeTraverse[24]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET 12" )


		if (int(nodeTraverse[25]) < 0):
			print("INVALID DOUBLE INDIRECT BLOCK " + str(nodeTraverse[25]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET 268" )
				
		if (int(nodeTraverse[26]) < 0):
			print("INVALID TRIPLE INDIRECT BLOCK " + str(nodeTraverse[26]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET 65804")

		offset = 0
		for block_address in nodeTraverse[12:24]:
			if int(block_address) > int(int(Superblock.tBlockNum) - 1):
				print("INVALID BLOCK " + str(block_address) + " IN INODE " + str(
					nodeTraverse[1]) + " AT OFFSET " + str(offset))
			offset = offset + 1

		if (int(nodeTraverse[24]) > int(int(Superblock.tBlockNum) - 1)):
			print("INVALID INDIRECT BLOCK " + str(nodeTraverse[24]) + " IN INODE " + str(
				nodeTraverse[1]) + " AT OFFSET 12")

		if (int(nodeTraverse[25]) > int(int(Superblock.tBlockNum) - 1)):
			print("INVALID DOUBLE INDIRECT BLOCK " + str(nodeTraverse[25]) + " IN INODE " + str(
				nodeTraverse[1]) + " AT OFFSET 268")

		if (int(nodeTraverse[26]) > int(int(Superblock.tBlockNum) - 1)):
			print("INVALID TRIPLE INDIRECT BLOCK " + str(nodeTraverse[26]) + " IN INODE " + str(
				nodeTraverse[1]) + " AT OFFSET 65804")



		offset = 0
		for block_address in nodeTraverse[12:24]:
			if ((int(block_address) != 0) and (int(block_address) < int(int(groupData.firstInodeBlock)))):
				print("RESERVED BLOCK " + str(block_address) + " IN INODE " + str(
					nodeTraverse[1]) + " AT OFFSET " + str(offset))
			offset = offset + 1

		if ((int(nodeTraverse[24]) != 0) and (int(nodeTraverse[24]) < int(int(groupData.firstInodeBlock)))):
			print("RESERVED INDIRECT BLOCK " + str(nodeTraverse[24]) + " IN INODE " + str(
				nodeTraverse[1]) + " AT OFFSET 12")


		if ((int(nodeTraverse[25]) != 0) and (int(nodeTraverse[25]) < int(int(groupData.firstInodeBlock)))):
			print("RESERVED DOUBLE INDIRECT BLOCK " + str(nodeTraverse[25]) + " IN INODE " + str(
				nodeTraverse[1]) + " AT OFFSET 268")

		if ((int(nodeTraverse[26]) != 0) and (int(nodeTraverse[26]) < int(int(groupData.firstInodeBlock)))):
			print("RESERVED TRIPLE INDIRECT BLOCK " + str(nodeTraverse[26]) + " IN INODE " + str(
				nodeTraverse[1]) + " AT OFFSET 65804")


		counter = 0
		for block_address in nodeTraverse[12:27]:
			# if ((int(block_address) not in bfree) and (int(block_address) >= int(int(groupData.firstInodeBlock) + (int(groupData.tNodeGroup)*int(Superblock.nodeSize)/int(Superblock.blockSize))))):
			# 	print("UNREFERENCED BLOCK " + str(block_address))
			# if ((int(block_address) not in bfree) and (check_array[counter] == 3)):
			# 	print("UNREFERENCED BLOCK " + str(block_address))
			# elif ((int(block_address) in bfree) and (int(block_address) >= int(int(groupData.firstInodeBlock) + (int(groupData.tNodeGroup)*int(Superblock.nodeSize)/int(Superblock.blockSize))))):
			# 	print("ALLOCATED BLOCK  "+ str(block_address) +" ON FREELIST")
			
			node_referenced.append(int(nodeTraverse[counter + 12]))
			# print(str(nodeTraverse[counter + 12]))
			# inode_reference = []
			# offset_referenced = []
			# indirect_referenced_level = []
			inode_reference.append(int(nodeTraverse[1]))
			if (block_address == nodeTraverse[24]):
				offset_referenced.append(int(12))
				indirect_referenced_level.append(int(1))
			elif (block_address == nodeTraverse[25]):
				offset_referenced.append(int(268))
				indirect_referenced_level.append(int(2))
			elif (block_address == nodeTraverse[26]):
				offset_referenced.append(int(65804))
				indirect_referenced_level.append(int(3))
			else:
				offset_referenced.append(int(counter))
				indirect_referenced_level.append(int(0))
			counter = counter + 1

	for nodeTraverse in indirect_array:
		if (int(nodeTraverse[2]) == 1):
			# print ("1")
			if(int(nodeTraverse[5]) < 0):
				print("INVALID INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			elif(int(nodeTraverse[5]) > int(int(Superblock.tBlockNum) - 1)):
				print("INVALID INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			elif((int(nodeTraverse[5]) != 0) and (int(nodeTraverse[5]) < int(int(groupData.firstInodeBlock)))):
				print("RESERVED INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			node_referenced.append(int(nodeTraverse[5]))
			inode_reference.append(int(nodeTraverse[1]))
			offset_referenced.append(int(nodeTraverse[3]))
			indirect_referenced_level.append(int(1))
		elif (int(nodeTraverse[2]) == 2):
			# print ("2")
			if(int(nodeTraverse[5]) < 0):
				print("INVALID DOUBLE INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			elif(int(nodeTraverse[5]) > int(int(Superblock.tBlockNum) - 1)):
				print("INVALID DOUBLE INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			elif((int(nodeTraverse[5]) != 0) and (int(nodeTraverse[5]) < int(int(groupData.firstInodeBlock)))):
				print("INVALID DOUBLE INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			node_referenced.append(int(nodeTraverse[5]))
			inode_reference.append(int(nodeTraverse[1]))
			offset_referenced.append(int(nodeTraverse[3]))
			indirect_referenced_level.append(int(2))
		elif (int(nodeTraverse[2]) == 3):
			# print ("3")
			if(int(nodeTraverse[5]) < 0):
				print("INVALID TRIPLE INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			elif(int(nodeTraverse[5]) > int(int(Superblock.tBlockNum) - 1)):
				print("INVALID TRIPLE INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			elif((int(nodeTraverse[5]) != 0) and (int(nodeTraverse[5]) < int(int(groupData.firstInodeBlock)))):
				print("INVALID TRIPLE INDIRECT BLOCK " + str(nodeTraverse[5]) + " IN INODE " + str(nodeTraverse[1]) + " AT OFFSET " + str(nodeTraverse[3]))
			node_referenced.append(int(nodeTraverse[5]))
			inode_reference.append(int(nodeTraverse[1]))
			offset_referenced.append(int(nodeTraverse[3]))
			indirect_referenced_level.append(int(3))
		
		# for block_address in nodeTraverse[12:24]:


	# print(str(node_referenced))
	for blockTraverse in range(int(int(groupData.firstInodeBlock) + (int(groupData.tNodeGroup)*int(Superblock.nodeSize)/int(Superblock.blockSize))), Superblock.tBlockNum ):
		if ((int(blockTraverse) not in bfree) and (int(blockTraverse) not in node_referenced) and (int(blockTraverse) >= int(int(groupData.firstInodeBlock) + (int(groupData.tNodeGroup)*int(Superblock.nodeSize)/int(Superblock.blockSize))))):
			print("UNREFERENCED BLOCK " + str(blockTraverse))
		elif ((int(blockTraverse) in bfree) and (int(blockTraverse) in node_referenced) and (int(blockTraverse) >= int(int(groupData.firstInodeBlock) + (int(groupData.tNodeGroup)*int(Superblock.nodeSize)/int(Superblock.blockSize))))):
			print("ALLOCATED BLOCK "+ str(blockTraverse) +" ON FREELIST")



	# node_referenced = []
	# inode_reference = []
	# offset_referenced = []
	# indirect_referenced_level = []
	counter_reference = 0
	for block_counter in node_referenced:
		if ((node_referenced.count(block_counter) > 1) and (block_counter != 0)):
			# print ("test -- reaches this point")
			if (indirect_referenced_level[counter_reference] == 0):
				print ("DUPLICATE BLOCK " + str(block_counter) + " IN INODE " + str(inode_reference[counter_reference]) + " AT OFFSET "  + str(offset_referenced[counter_reference]) )
			elif (indirect_referenced_level[counter_reference] == 1):
				print ("DUPLICATE INDIRECT BLOCK " + str(block_counter) + " IN INODE " + str(inode_reference[counter_reference]) + " AT OFFSET " + str(offset_referenced[counter_reference]) )
			elif (indirect_referenced_level[counter_reference] == 2):
				print ("DUPLICATE DOUBLE INDIRECT BLOCK " + str(block_counter) + " IN INODE " + str(inode_reference[counter_reference]) + " AT OFFSET " + str(offset_referenced[counter_reference]) )
			elif (indirect_referenced_level[counter_reference] == 3):
				print ("DUPLICATE TRIPLE INDIRECT BLOCK " + str(block_counter) + " IN INODE " + str(inode_reference[counter_reference]) + " AT OFFSET " + str(offset_referenced[counter_reference]) )
		counter_reference = counter_reference + 1



###inode part ###
	validNodeList = inodeList
	validIfree = ifree
	for nodeTraverse in inodeList:
		if nodeTraverse.fileType == '0':
			print("UNALLOCATED INODE " + str(nodeTraverse.nodeNum) + " NOT ON FREELIST")
			exitFlag = True
			validNodeList.remove(nodeTraverse)
			validIfree.append(nodeTraverse.nodeNum)
		else:
			if nodeTraverse.nodeNum in ifree:
				print("ALLOCATED INODE " + str(nodeTraverse.nodeNum) + " ON FREELIST")
				exitFlag = True
				validIfree.remove(nodeTraverse.nodeNum)
				
	for nodeNumber in range(Superblock.nonReservedNode, Superblock.tNodeNum):
		usedFlag = 0
		for nodeTraverse in inodeList:
			if nodeTraverse.nodeNum == nodeNumber:
				usedFlag = 1
		if nodeNumber not in ifree and usedFlag == 0:
			print("UNALLOCATED INODE " + str(nodeNumber) + " NOT ON FREELIST")
			validIfree.append(nodeNumber)
			exitFlag = True
######

	
### directory part ###
	for nodeTraverse in validNodeList:
		countLinks = 0
		for dirTraverse in direntList:
			if nodeTraverse.nodeNum == dirTraverse.referencedFileNum:
				countLinks = countLinks + 1
		if countLinks != nodeTraverse.linkCount:
			print("INODE " + str(nodeTraverse.nodeNum) + " HAS " + str(countLinks) + " LINKS BUT LINKCOUNT IS " + str(nodeTraverse.linkCount))
			exitFlag = True
	
	for nodeNumber in validIfree:
		for direntry in direntList:
			if nodeNumber == direntry.referencedFileNum:
				print("DIRECTORY INODE " + str(direntry.parentNodeNum) + " NAME " + direntry.nameStr + " UNALLOCATED INODE " + str(nodeNumber))
				exitFlag = True
	
	for direntry in direntList:
		if (direntry.referencedFileNum < 1) or (direntry.referencedFileNum > Superblock.tNodeNum):
			print("DIRECTORY INODE " + str(direntry.parentNodeNum) + " NAME " + direntry.nameStr + " INVALID INODE " + str(direntry.referencedFileNum))
			exitFlag = True
	
	inodePointer = []
	for direntry in direntList:
		if direntry.nameStr == "'.'":
			if direntry.parentNodeNum != direntry.referencedFileNum:
				print("DIRECTORY INODE " + str(direntry.parentNodeNum) + " NAME '.' LINK TO INODE " + str(direntry.referencedFileNum) + "SHOULD BE " + str(direntry.parentNodeNum))
				exitFlag = True
		if direntry.nameStr != "'.'" and direntry.nameStr != "'..'":
			itemList = [direntry.parentNodeNum, direntry.referencedFileNum]
			inodePointer.append(itemList)
		
	for direntry in direntList:
		if direntry.nameStr == "'..'":
			if not inodePointer:
				if direntry.parentNodeNum != direntry.referencedFileNum:
					print("DIRECTORY INODE " + str(direntry.parentNodeNum) + " NAME '..' LINK TO INODE " + str(direntry.referencedFileNum) + " SHOULD BE " + str(direntry.parentNodeNum))
					exitFlag = True
			else:
				opFlag = 0
				for items in inodePointer:
					if items[1] == direntry.parentNodeNum:
						if items[0] != direntry.referencedFileNum:
							print("DIRECTORY INODE " + str(direntry.parentNodeNum) + " NAME '..' LINK TO INODE " + str(direntry.referencedFileNum) + " SHOULD BE " + str(items[0]))
							exitFlag = True
							opFlag = 1
							break
						opFlag = 1
				if opFlag == 0:
					if direntry.parentNodeNum != direntry.referencedFileNum:
						print("DIRECTORY INODE " + str(direntry.parentNodeNum) + " NAME '..' LINK TO INODE " + str(direntry.referencedFileNum) + " SHOULD BE " + str(direntry.parentNodeNum))
						exitFlag = True
	
	
######

	if exitFlag:
		sys.exit(2)
	else:
		sys.exit(0)
if __name__ == '__main__':
	main()
