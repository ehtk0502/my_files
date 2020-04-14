Time-based One Time Password algorithm specidied in by rfc4226

Given a secret key and time window, the algorithm produces some number of digits specified by the user.
The algorithm is useful as it will produce the same output within the same allocated window.
It is notable that the only input being changed over time is time. As the time value increases, the window
moves onto the next step. This causes HMAC Crypto algorithm to produce a totally different output.
With SHA-256, HMAC outputs 32 bit long byte array. The last 4 bits are used a an offset value into which 
index of an array will be used as most significant bits of the output. The returned output is 31 bits long.
As we do not want negative values, the largest 8 bits are masked with 0x7f. Finally, the output is truncated
to the numbers of digits desired.

One thing that I noticed is that byte[] returned by HMAC includes some elements that are more than 8 bits.
We only use 8 bit values and all the elements need to be masked by 0xff.