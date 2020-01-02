#! /usr/bin/gnuplot
#
# purpose:
#  generate data reduction graphs for the multi-threaded list project
#
# input: lab2_list.csv
# 1. test name
# 2. # threads
# 3. # iterations per thread
# 4. # lists
# 5. # operations performed (threads x iterations x (ins + lookup + delete))
# 6. run time (ns)
# 7. run time per operation (ns)
#   8. lock obtain time
#
# output:
# lab2_list-1.png ... Number of Threads(mux, spin) vs Throughput
# lab2_list-2.png ... Average Time for Operation and Mutex Wait
# lab2_list-3.png ... Correct Iterations vs Number of Threads
# lab2_list-4.png ... Number of Threads vs Throughput(Mux)
# lab2_list-5.png ... Number of Threads vs Throughput(spinlock)
#
# Note:
# Managing data is simplified by keeping all of the results in a single
# file.  But this means that the individual graphing commands have to
# grep to select only the data they want.
#
#	Early in your implementation, you will not have data for all of the
#	tests, and the later sections may generate errors for missing data.
#

# general plot parameters
set terminal png
set datafile separator ","

set title "Number of Threads(mux, spin) vs Throughput"
set xlabel "Threads"
set logscale x 2
unset xrange
set xrange [0.75:]
set ylabel "Throughput"
set logscale y 10
set output 'lab2b_1.png'

plot \
     "< grep 'list-none-m,[0-9]*,1000,1,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'Mutex synchronized list operations' with linespoints lc rgb 'red', \
     "< grep 'list-none-s,[0-9]*,1000,1,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'Spin-lock synchronized list operations' with linespoints lc rgb 'green'

set title "Average Time for Operation and Mutex Wait"
set xlabel "Threads"
set logscale x 2
unset xrange
set xrange [0.75:]
set ylabel "Time (ns)"
set logscale y 10
set output 'lab2b_2.png'

plot \
     "< grep 'list-none-m,[0-9]*,1000,1,' lab2b_list.csv" using ($2):($7) \
     title 'average completion time' with linespoints lc rgb 'red', \
     "< grep 'list-none-m,[0-9]*,1000,1,' lab2b_list.csv" using ($2):($8) \
     title 'average mux wait time' with linespoints lc rgb 'green'


set title "Correct Iterations vs Number of Threads"
set logscale x 2
set xrange [0.75:]
set xlabel "Number of Threads"
set ylabel "Correct Iterations"
set logscale y 10
set output 'lab2b_3.png'
plot \
     "< grep -e \'list-id-none,[0-9]*,[0-9]*,4,' lab2b_list.csv" using ($2):($3) \
     with points lc rgb "red" title "unprotected", \
   "< grep -e \'list-id-m,[0-9]*,[0-9]*,4,' lab2b_list.csv" using ($2):($3) \
   with points lc rgb "green" title "w/mutex", \
    "< grep -e \'list-id-s,[0-9]*,[0-9]*,4,' lab2b_list.csv" using ($2):($3) \
    with points lc rgb "blue" title "w/spinlock"
    
set title "Number of Threads vs Throughput(Mux)"
set logscale x 2
unset xrange
set xrange [0.75:]
set xlabel "Threads"
set ylabel "Throughput"
set logscale y 10
set output 'lab2b_4.png'

plot \
     "< grep 'list-none-m,[0-9]*,1000,1,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=1' with linespoints lc rgb 'red', \
     "< grep 'list-none-m,[0-9]*,1000,4,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=4' with linespoints lc rgb 'green', \
     "< grep 'list-none-m,[0-9]*,1000,8,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=8' with linespoints lc rgb 'blue', \
     "< grep 'list-none-m,[0-9]*,1000,16,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=16' with linespoints lc rgb 'violet'
     

set title "Number of Threads vs Throughput(spinlock)"
set logscale x 2
unset xrange
set xrange [0.75:]
set xlabel "Threads"
set ylabel "Throughput"
set logscale y 10
set output 'lab2b_5.png'

plot \
     "< grep 'list-none-s,[0-9]*,1000,1,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=1' with linespoints lc rgb 'red', \
     "< grep 'list-none-s,[0-9]*,1000,4,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=4' with linespoints lc rgb 'green', \
     "< grep 'list-none-s,[0-9]*,1000,8,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=8' with linespoints lc rgb 'blue', \
     "< grep 'list-none-s,[0-9]*,1000,16,' lab2b_list.csv" using ($2):(1000000000)/($7) \
     title 'lists=16' with linespoints lc rgb 'orange'



