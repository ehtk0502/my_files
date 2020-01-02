(*defined functions*)
type ('nonterminal, 'terminal) symbol =
    |N of 'nonterminal
    |T of 'terminal;;

type ('nonterminal, 'terminal) parse_tree =
  | Node of 'nonterminal * ('nonterminal, 'terminal) parse_tree list
  | Leaf of 'terminal;;

(*1*)
let isNonterminal a = match a with
    |N s -> (s::[])
    |T s -> [];;

let rec findCand candList b = match candList with
    [] -> b
    |f::r -> if (isNonterminal f = []) then (findCand r b) else (findCand r ((isNonterminal f)@b));;

let rec helpFunc rules ruleModify candidate keepTrack = match candidate with
    [] -> keepTrack
    |f::r -> if(ruleModify = []) then helpFunc rules rules r (f::keepTrack)
             else if (List.mem f keepTrack) then helpFunc rules rules r keepTrack
             else if (fst (List.hd ruleModify)) = f then helpFunc rules (List.tl ruleModify) (candidate @ (findCand (snd (List.hd ruleModify)) [])) keepTrack
             else helpFunc rules (List.tl ruleModify) candidate keepTrack;;

let rec sortLists rule m_list acc = match rule with
    [] -> List.rev(acc)
    |f::r -> if (List.mem (fst f) m_list) then sortLists r m_list (f::acc) else sortLists r m_list acc;; 

let find_reachable x = 
    let m_candid = helpFunc (snd x) (snd x) ((fst x)::[]) [] in sortLists (snd x) m_candid [];;

let rec findPairs symb m_rule = match m_rule with
    [] -> []
    |(m_symb, rules)::r -> if m_symb = symb then rules::(findPairs symb r) else findPairs symb r;;
    
let convert_grammar gram1 = (fst gram1), fun nonTerm -> findPairs nonTerm (find_reachable gram1);;


(*2*)

let rec findList obj = match obj with
    Node (s,x) -> traverseList x []
   |Leaf s -> [s]

and traverseList m_list acc = match m_list with
    [] -> acc
    |f::r -> traverseList r ((findList f)@acc);;

let parse_tree_leaves nodes = List.rev (findList nodes)

(*3*)

let isAccept m_val = match m_val with
    Some s -> true
    |None -> false;;

let termSym m_sym fragmt = match fragmt with
    f::r -> if f = m_sym then r else fragmt
    |[] -> [];;

let rec fragHandler m_list f_len rules fragment = match m_list with
    [] -> fragment
    |(T s)::r -> let n_frag = (termSym s fragment) in if (List.length n_frag) < (List.length fragment) then fragHandler r (f_len-1) rules n_frag else fragment
    |(N s)::r -> let n_frags = (helper (rules s) f_len rules fragment) in if (List.length n_frags) < (List.length fragment) then fragHandler r (f_len - 1) rules n_frags else fragment
and helper lists lens m_rule frags = match lists with
    [] -> frags
    |h::t -> if (lens - 1 + (List.length h)) > (List.length frags) then (helper t lens m_rule frags) else let newFrag = (fragHandler h (lens - 1 + (List.length h)) m_rule frags) in
        if (List.length newFrag) < (List.length frags) then newFrag else helper t lens m_rule frags;;

let rec findSuf acceptor m_frag ruleList symRules = match ruleList with
    [] -> None
    |f::r -> let suf = fragHandler f (List.length f) symRules m_frag in
        if (((List.length suf) < (List.length m_frag)) && (isAccept (acceptor suf)))
        then acceptor suf
        else findSuf acceptor m_frag r symRules;;

let make_matcher gram = fun accept frag -> findSuf (accept) (frag) ((snd gram) (fst gram)) (snd gram);;


(*4*)

let accepts = function
   | _::_ -> None
   | x -> Some x;;

let isAcceptP m_val = match m_val with
    Some s -> true
    |None -> false;;

let termSymP m_sym fragmt = match fragmt with
    (_, f) -> if (List.hd f) = m_sym then (List.tl f) else f;;

let formLeaf fragTree m_frag m_sym = match fragTree with
    (s,f) -> (s@[Leaf m_sym], m_frag);;
    
let formNode fragTree m_fragTree m_sym = match m_fragTree with
    (s,f) -> (fst(fragTree)@[Node(m_sym, s)], f);;


let rec fragHandlerP m_list f_len rules fragment_tree = match m_list with
    [] -> fragment_tree
    |(T s)::r -> let n_frag = (termSymP s fragment_tree) in if (List.length n_frag) < (List.length (snd fragment_tree)) then fragHandlerP r (f_len-1) rules (formLeaf fragment_tree n_frag s) else fragment_tree
    |(N s)::r -> let n_frags = helperP (rules s) f_len rules ([],(snd fragment_tree)) in if (List.length (snd n_frags)) < (List.length (snd fragment_tree)) then fragHandlerP r (f_len - 1) rules (formNode fragment_tree n_frags s) else fragment_tree
and helperP lists lens m_rule frags_tree = match lists with
    [] -> frags_tree
    |h::t -> if (lens - 1 + (List.length h)) > (List.length (snd frags_tree)) then (helperP t lens m_rule frags_tree) else let newFrag = (fragHandlerP h (lens -1 + (List.length h)) m_rule frags_tree) in
        if (List.length (snd newFrag)) < (List.length (snd frags_tree)) then newFrag else helperP t lens m_rule frags_tree;;

let rec findSufP m_frag ruleList symRules startSym = match ruleList with
    [] -> None
    |f::r -> let suf = fragHandlerP f (List.length f) symRules ([], m_frag) in
        if (((List.length (snd suf)) < (List.length m_frag)) && (isAcceptP (accepts (snd suf))))
        then (Some (Node(startSym, (fst suf)))) 
        else findSufP m_frag r symRules startSym;;

let make_parser gram = fun frag -> findSufP (frag) ((snd gram) (fst gram)) (snd gram) (fst gram);;
