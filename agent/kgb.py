from z3 import *
from binascii import b2a_hex,a2b_hex

s = Solver()

r = "0064736c707d6f510020646b73247c4d0068202b4159516700502a214d24675100"

r_result = bytearray(a2b_hex(r))
print(r_result)

for i in range(int(len(r_result)/2)) :
    c = r_result[i]
    r_result[i] = r_result[len(r_result)-i-1]
    r_result[len(r_result)-i-1] = c
print(b2a_hex(r_result))


x = [BitVec("x%s" % i, 32) for i in range(len(r_result))]
for i in range(len(r_result)):
    c = r_result[i]
    print(i,hex(c))

    # z3求算法的逆运算
    s.add(((x[i] >> (i % 8)) ^ x[i] ) == r_result[i])
if (s.check() == sat):
    model = s.model()
    print(model)
    flag=""
    for i in range(len(r_result)):
        if (model[x[i]] != None):
            flag += chr(model[x[i]].as_long().real)
        else:
            flag += " "
    print('"' + flag + '"')
    print(len(flag), len(r_result))


'''
    private String b(String str) {
        char[] charArray = str.toCharArray();
        for (int i = 0; i < charArray.length; i++) {
            charArray[i] = (char) ((charArray[i] >> (i % 8)) ^ charArray[i]);
        }
        for (int i2 = 0; i2 < charArray.length / 2; i2++) {
            char c = charArray[i2];
            charArray[i2] = charArray[(charArray.length - i2) - 1];
            charArray[(charArray.length - i2) - 1] = c;
        }
        return new String(charArray);
    }
'''