(*1*)
let rec subset a b = 
    if (List.length a > List.length b) then false 
    else if a = [] then true
    else if List.mem (List.hd a) b then subset (List.tl a) b
    else false;;

(*2*)
let rec evaluate a b = match a with
    [] -> 0
    |f::r -> if List.mem f b then (1 + evaluate r b) else (evaluate r b) 
    
let equal_sets a b =
    if not(List.length a = List.length b) then false
    else if (List.length b = evaluate a b) then true
    else false;;

(*3*)
let rec set_union a b =
    if a = [] then b
    else if List.mem (List.hd a) b then set_union (List.tl a) b
    else set_union (List.tl a) ((List.hd a)::b);;

(*4*)
let rec help_intersect a b c = match a with
    [] -> c
    |f::r -> if List.mem f b then help_intersect r b (f::c) else help_intersect r b c;;

let set_intersection a b =
    if(a = [] || b = []) then []
    else help_intersect a b [];;

(*5*)
let rec help_diff a b c = match a with
    [] -> c
    |f::r -> if List.mem f b then help_diff r b c else help_diff r b (f::c);;

let set_diff a b =
    if a = [] then []
    else if b = [] then a
    else help_diff a b [];;
    
(*6*)    
let rec computed_fixed_point eq f x =
    if eq (f x) x then x
    else let tempX= f x in computed_fixed_point eq f tempX;;

(*7*)

type ('nonterminal, 'terminal) symbol =
    |N of 'nonterminal
    |T of 'terminal;;

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

let filter_reachable g = find_reachable g;;
