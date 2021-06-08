import * as React from 'react';
import { Avatar } from '@fluentui-react-native/experimental-avatar';
import { Text } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { AVATAR_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ImageURISource } from 'react-native';

const testImageSource: ImageURISource = {
  uri:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAgAElEQVR4nHy8aZNkyZWe97j7XWPfcq/K2qsXdDeWxgCYATQzJEUbjpFGkRyZRpLJTPom6f/oJ8hEicYPYyIlIwUMZgAQgwEwaAC9VXdXVdeamZVb7BF3dXd98BsRWRiZ0qwq0yIjb9x7zvH3vOc9x138yz/+fYuxACCq/yRgLUIIDAKLRWIBgUUgqveJ6k9KbUnSBf/8v/lz/tWf//fEUUxhBCUCIRVYAVgQFqEN0yTl2asjnj55yHh0wq37b3P/9ldo1WpEUYAvFAqBFYLCgjYgpUAqVX22BWPAgl3duHCfIbAoKcDANEl59PxLHn/+EfVWnfff/x6DRhspBNZq3JVsdQ2w1mABicQXEoEFDKBRQgJQFCWLJGU0nTGeTbi4PGM4OqHd6bC/fQsrPSbpkjRN2N/eZn+wQ6h85nnBp48/5cMPfkq+XNBqNNnZ2sd7zfDWuodbm3b1P1jk+mfWr63ebfCkQCnPPZK1GGvBCoy16OoJJWCNJity8qLAWoMXhARRHeFFSOUjhEQIgUBgqs8RUlSvucDAmpXlEdZiEe417NUbxmiNNRolBMrzEeLKL0V1CeGcZY1wfty4Y/2cwjpHYS3GGLQx69vQ1rj4QoKULizt6ubccwjL2i6r55FSghSVA9wnXzH+KjZWrpBciTXAYrAIIV0UWotUkigK8TzlHtQatDZoayksWCvwhMBgKLRZf5QfRjSaHeIgIvA8Zyy5so5F2vWPYPTveN9WD2947cuCsWCsQQiB7/sEQYAUkiouNua1wr1mDda49SClweDuhZXTjQsqY9z7sLigqGwgqyCxmwtvwli85k6kkEgpEUJeXQF24wgLVjjoEYCsvtsr/5yR3SW1tSAlURSjpFeBExhrKa3FGHctKxWygiWlFFa7B47CiMj38aRESbu+aXElyoW4EhyV8f//vlbrVyCxgvWKvIpgKwwz1mCNqVauxkiB8iRSqI3lrHVOurLSjHBmlsL9E2soXD2AqOzoPlcbjcCujS/XDsBFsRAu2m2F+yCxVmCERV4NsCqENivaIqXAD0KklOt7XjlJyOrDlAfWoqSsbhgwGmkNSjgji82HVI6wlZ3E5rUrtl/5xbKKPoNdGRoXsWWpKYqCoiwpSo2SVDDiwslaKI2lNJqy0AS+xFMKZap8J0BIEMYZ2TnKrQTjPOmgU4rNSqnMLpxRXQBW9y+lQEiJQWwcUFm/Spgg7OYPVwAkrvzb/JmoIMjD89TrMWgtUuCWnBJ4Aoy2qFWgCAduWF1FV+VcIdeGuYr1CPH3QdKuFkSFscK4axtLWWToMgdWRCEn8gp8JTHWVkZxzss0FKWl1AaUpFbhvhQWJd1zSWGQ2iDk6v7sGiXcPW/SNthN3lo9RkVshFIOugDPrCN/5Wq7TmzOh5tHNv8fDlihgZQSz/OcZW2VOYTAQyBcvkFKl8gUoCo25R6GCgIExoKqMMiusN1hnntgs1qfm+g1ljWEIF3A6NKQ5TkYg+cpSitY5CWxtmgJK2YgRAVROKKxgg1jLEiDXNlGiOpe5ZUAFZtAEWLz6AikVKjq2VbL1lR2lUJV+UPgWeGiR1W0y9qrGOw89nrUrSJ/c21Rwco60bEyuHAGM8bduLAbLK3+WikfJdUmgq+41xq3lMtV0ra2uobBYh3LqSK40JbSWHxP4gkfo20VGFUQCYlVPgaFQSAruBByE1iyMv5VuF0HnAVjXZSLKxR8jfhCOrJS3ePKwCsYtpY1exJq7Tu8dbKo3rX2NnbNFjbZfIWsbJYeFmsMnu8RxTFSSLQ1a4jZRAXrxKktaOHyhsQxE6011quCoKJ6VEmxyIuKoVCVKc5Z2jiKmxtLbtw9RUAUuI9SFRuTQuIFEbIy8mpFSVnljVXEIVBS4SuJkmK9Oq9k4nXgOfgybqWs2NDKUCsYF5tgcqvUWe5qbvBWRrGrhFk5w0WFXGOXqVbEKizWac5AaQ1CKZTnc+UON/i8TkSONwMo6aGUhy5y8jSlyDN8BUoGgHF0D0izgqzUlMa53BiDJ6hwXFIYQ6adIwQGa6VbIdZQFjlWl66OkKKiobainpVDpYNKMCgl8IRCraMXEFWeEM4qxmqMMS7Rrvkxa86/IgorWrpeRtUKd4Z35MbCFRZUXcSsL2hXbAshV6hbrZDXGKG7sJSO2648vEqMq2WnhHAJtopsJSTSU8yXJfPFkqyeoTwXdXK1ZIWksJKl1giEYx7V7SlrybMCLQWlcTWHwELgIT3PGck4LqKUcve04t9VDii1do6QIKRPWRYVQ/Nc8BjHdlxeFNU1tbsPVrxFVCzJrQArbAVjsnLsFTthKsBZ5VuBJ9ewciXlrry5CuP1z69/rSo7cIXYihHZyoDGaIw2mFU6lRKtHaYba5FCgpDMspJFYQiNM4qSPlL6JMmCi4tTcmNo9bfxogbZYuFgSTvmpAvn0MD3QShXZZclYb2BnM/wvIBYKbKyJEtT8jDEtwKdZ+iyRAiBNoZSLyitJQp8AhUTKH8d4Wq96leVRVV0uTW3gZQVKljr8sHKihVRMMYgbJVDpPvuXa3Q1t9XYMuG+q1wbeUge8UhKxaklKreY8BotNbkZYnWzr2F2jjAJS3wlMRXyvFn4SFlQLFc8ujjH/Po099w9vI54+EYEdb4xp/8F9z52rcpyhKjS/zAJ19OmVycsRwPGb46ptQF47NXBCrkxrtvU2t4FJMxQWMLPR9zkSb4StDudJ0M4gcsZlOmwwu6u3sUZcl8uaAWtB08SelylRAYKRClBikqKLNr2F6n5jVqsMb5q4ZaE5wqC3srQ6+id0WrhODKa1UyXeWL19aB+wS3tDf4b4whKwomWUGhXS0QK28NI9J9AO0opiU1HgXZfMbzX/2EL37zK06OnzEbnYIMyNKc048/4uLJQ9753nfpDLZo9XaIGy0+++ADTp98wXK+YD6d0GjWWMxmmCJhPHxMs9NBCUN//yaBHxENDqAUTM6PiHyPaZGSF4ZGb5e43iZN5hiTkeUpQRS7grHKZaYiAtpSQXXF+qWoMH9jXCWo7LFBGAeJBiE85zQp8Vbm3MCJe/tq6awtetWVK1FJXIEpcdXVKw0RstKSaY0vJZHnxKrSaHwJbxzeoBlAkWccP3vA448+5MUXv+FiOCUrFKHv4wWKZq/PjTsH2HzK8Iuf8+y3OZqQ5SJnMV/Q3Rqwd+suN7a/gSlLstkUdE6ep4zHC2q1iCcPPuHBBx+wf/M2B7fvki7HmDylyFKEhO2bb/PleEEhIt79gz/CD0KXOI11nLqqDbR2cIKU2Ir9rDWhK/Z7zV6C6m8N2A09FVyRIlYGtWsm9Luv/32wsmsWsFI7qsKk+mslJYGnKLRmReEElijwiND4OsH3Ip49fMQvf/RDXjx8gpYh9e42NVMQxwGtdotrNwdcHD3h4aNTzs+WLNKCyfAIpKDTbaHmGZ00o7wcIlRInlhGL1+BTWl16oS+T60RMRsP+ehnPyGZnhM1G2SzMYE0CFKefvCfGA8XNK/fxZOa3T/9M0TggS3dCheVglmxIykkoiL0qxywgaJNgn6Ntq4CVcgNBK8NKq4ad8Vjrxp4VQvZK/TKJRtrBcrz8H2/Eq03PFhJiapUTik9PFOg5+fMR0/wFFwME7548BlIj8HhLcJGDc8mtNsNgqjJ7uEen330OX/xr/+Gy9GCeqtOFEfMC0uv18AqCV5AphXnj5/Srks8KWiGOX4YkSUJZ+MhnU6dfq/F9k6bWsNnuViwnMwoZM7wbEqWlGxdv0atW+fjn/wHrh/e4Z2vfhNrSnQJnu8q2XVc2wp+rHFOkOv0XDlpRW/F+v2mor4r+GXlgHVZdoXVbKqKjSpq7YYpcSXmhaXSuDfLTlQOkNKJcLHvUZMlZTYnS2fkyxGffvIRR6dzvHqfdm+LQaQo5mf0tvbwa/sU6ZL/9P2f8O/+7V8jfcnWbhfPCyi1ptVuIhEUucUPQtqdDmjNxaOP2apprt/cYvvGAONFnJ+cMz2/ZHQ8pdaIUbqk0e2QL3w++tUTpBDcvH9I3KiRzyc0u13SsmAyumB7sEWWLh2bs5a8yNHGoI1d1yoOfuTaclSv/W4hZoyjoVKoKkuDtzLoCsGM2Jh4RYYcdXIaixGr5bUJBCtAed5aCV03LQClFA1riM0cnSTMZ1MWswkvHr/kxfElgxtvYMscTEoxnVOLFPs33+TifMwvfvRTfvB//TVho06jWWew1SNPC1cBa+MqWW2JPMH50Ut62z3OgzqX2ZJoqpk9ekVQq9OqR9Rv3+Ty9JzJ+Zijp6cEgUd/t8e9d2+R5oLCSr744ox2SzHYDZmcv+CT5YTWH/wxYRSRpUv8IEQphdZOVl5RzxXcOKbvMvYqyle5dK2GVtRbVn/nOU3JrrHfwZFcozl2BUCsL7hZhZu8oKRynsUipMRKic5yRLpEFXMW6YyiLJlcnjI6e0laWL72x/+cfHnJk49+ThDW8UTO1t4bqLDOr3707/ns44f09rfxlKTRaFCvR3jKZz6bg9FEYYgMBNf2W5y/GnP++Jw7b+7w13/1gEyEtFoeybNX9Dp1dg+36fQ6xL4kbIUk0wXpYk5oLY16ExlGLIsu55M58+ETRq/+d8JmjXJ0xJ/8+f+ILQKyvMRTClkxQqfrs4GbleZSvSaEWL+0oq1Xk7W14ImVFCU23Zy18ddAs5Iq7KYmu/LdWuNWlNysHWssHpoyG7GcDSm1YToZUmu12Wu8w4H08JTl13/1Y6aXZ1y//w61qEVz6zpPP3/Mpx9+QtxtIJY5s+GYsNemLA1SCdrtBgrDeDhmmZYoAd/9g7f4N//bD+i3Jd/+9m1+9uNPObwxoNFusSw1H/7yATXPst2P6fViGoMW49GEy6MThHdBZ6vLbq+LEHWSucfFcEyrSPnxX/wfvHz4BVvXb9Pa2WP7+l2avT2sWaCLHClcxS6qBL2B4FUpVimtV5jjuj4Q4EElB0rhVsLvvJlq+awztb1SM2zyC57n4/k+WEGyWLho0AlFMiaZXVCUliBskMwSVNBg73Cb0y9+Ra3W5N77f0Sz08JXTvt5/NGvqDdCZtMlNi3Y3uqyc+OQk5dn6GzJ7buHLGdTTl4e44U1JuMlW9stvvbNN3n1/AX/4J9+leOTOR998Blb2z3azYidbsxsmvDg8ZDeqE6/VcMrDd16iAkCJpdTdJaB8bCqSSlCZomgEfj8/Pv/AT/w0Qh2b9/iT/67/5ne9TdhPkJag1c1nKRwNtzQoCtSRCWNrO2KwLX/AVtNQaw09vUywGLFlX6rcFTyahVcIROe5xEEIWmSkKUJyg+Yjy8Ynl9QGkWzt43AcHF8xN7hDYYvPmcxveDNb/0hvZ0bLMdj5sMTPvir/5Od/SZf+drbYDS1RkC702R4MeL05RGRtKiygDTj2laPd9+8xXi45MXjI77+9Vt0d/qkieE733mH7lafyWjG8cmQl6/GXLt/gKk1+Olvj/mbj4/48rIkVzGtRshgt8d8URAITYijr1hDURrCVp+w3mT3+iHHn3/GD/7X/4UXn32AKUssFlXB0rptajd5YaUsrNRTVv2XyjnSXqFWLqjF65G/wqWK87/WpaouYqxB+QGmNKTLOfV2hyLPmI3GKD+kM9ijSDNePvqMnRu3kSbl+OGHNHpblKVlNjzDlnMmZ8ccff4lIs1ptlsYIckLTblYoM+OeWOnxVdubNNXcHe7z/fe/wrvv3WHN27d5MnDE1SRcOfWDss0p6Ykv/fOdQ52W2z3GxSZ4fjFkPtvHXB4cwsrJC+GCR89mTCeFQx2WtQ6DYy2hMoQBpJev0Y2n7G13cXzJI12i8O33uPlF59x+vSB07KMQXmey3vrWufKIljbtirqYN1DriDIgZSQK6OvQewK5dwUacC6RbmSLlzrUVHmGY1mB+WHzI+eY7MZzW6PLJlz/OwR7a19dq7f4OFvf0R3ZxtUnfFwQm/Q4/zLx8wuxgzPEy5OLujuBzR9SyuOODzYZtBpUq/V8HyfuF6n0Wzj+xFIj+1teP6izsmzEdsHDZIyI8lKtlsB9Xt7zBc5SVKSlYbZ0SX3r/cYzmpcXEzR1nJ6mbF7aIhqEcl0Tp6URMKn2akxGU/pbzWJA0FUa7J19xrHjz8imY3xfR+vKqoQYt0jtla7euhKQetysKmMrxxtR6waMlUiFa5XKoRd/9Fay7iyEtYNFuHwqyw0odT4skB6PlmS8erxr1mcf0le3CHX0N29wWD/BsePH7AYn7H77vskeUB3oHj8278hGZ4zupgxmjqq2suaXB80kYXmxrUdup0eUiiCsIYKQ7zAx/dDhFREFu7fvc3J0RHD50f4NUFvq0733V3GFwuml3NmkyVKesyXmovhjH4toGjWmY1nWG3QpSGuxcyiGjotCQOPKAowgc+jh0fsDOp0SsPFy2OsiJgNz9DFDC+IKMrcBeGVgQRtNeJK6jTWNZpEhdkS15/wNnnCNSuqjufG4Cu2w+8UYhXBtcawe3iDN959ByEVi8WCLMuJajGm08ePAopUENRaZGnCZHRJf+8Gnh9R9wUvH/yaj/7q+1y7uc1oNKdeq1NvhOTTMZ7WBL5HLYzwlIdAYqzAkx5SVou3zF2CKzWDfh/SJcOTY+avJtTbIY1ek+atbdI859XjYzqRoLXbYTSZU4SK/o0dunWJFhblC/bfeIPh6ZjZxQlhJGh2O7x4ckq4kIiHD5HC4kUtnn/xhOA//htufuN7RJ3dquJXDpZWBewVwmKtqXoLr+OTtzHwRl6wryXiq7LSFYDDQZSxgm/8/ne4/9ab5LkGX1OmMywG1egznWdo4yOXS6bDU4I4JFAlZ5//AhHGfPF3v2DvYIDBwxrJd773Dt2dOs9++5Dx+Zh7b94himtgJdL38aMaQdwAU1bilkUXpnpYS393j6gWcvr0Ka8eXiDkkLAR0t7v0t9qcvryAmlCWlGIlR7+VhthMpTncfHqnMH1Bq3tLtYkGGMR0kfFDdI0I88E7XaEUJbR+YS//ff/D6ZMee9P/2unC7FhPkr+biW8kjKEG3MUq47YOqFWsCMqjLEb3WctTIgV9XfdoTwruP3WXW7e2ELpgiTNUFpQZjMujp9yfjkiLRS1ZpdOnrK9v0dyMeLyyQNGr44RcZcbb9wFNB/94gFbB/vceO8el0+fcPbsnH6/z+HNm0RhEyskXhgR1GoI6YFQCK3RZYZUAcaWWKtRQUB7exfPDwhrL5lNJmTzJccfvaSx1WBrq8foco5OS1r1GBt7TF4NGex2ae/GnD5/Tn3Qp9FpIETAQDXxowCznFOLPKSSkMy5cfcalxctPvrxz9i59yb9/TcpimKtjG6aNFUtUDWqlFQIqdbCnWRtWLPul/5O2K8ruhW+GWOQStHf26a71aEW+QRhjbLIWU5OyecXlOmSZDqlXo/Yv36dW/ffZmdnmyjyWMxTskXK7vUDurs7PHrwjFa/yXf/5T8GUefBTz9hMOjytd//BtvX7+DXm4TNNmGjhRc3kH6IDGLwQvAChKeqQkghfdeXjlsd9m7fZ+/WHXZu3aS3v0UySimXlsH+AIUhm83QaYrOEmSZ8/V/8Kd840/+W4KghSlSggDqsYBk6VqqQhI0mjQ6HdrtkHtvX0cFHX77lz8knZ0hpO9gXFDNs16V2RxhcVMjG0Ljuby6Ujyta2pXuLTy4NXCbDU+EgRe1SmCXreDRFImY5cUG10629dp7b/J3t13CYKIMPAZv/yEyatnlFlKu9cinS95/MVLWvWS7qDJ01/8ipPHx1w/3OXGzUO29m4g4zpYi1I+XhQjVOSSmRAEtSYIhc6XZMsppQGDwBQWXZZIKWh1+9RabVq9FnEjZjmbE0QRcTNCzzPGF9NqYiFH5lPe/dYfcv32PYbHn3N5+gRz/IzBdoy1lnSpyZKERqvG5dmY3etbXLt9wJcf/5bh88/Z/vZbLPLFWrpeyQ4rdWAjY26+PAubIaNqNNAayyqFW1xH6GobUkqBLjWL6YStwdfpdLdIkhm1Zodm7xqTyxMWy5Q7X/s2nf4ey+kFyWyG0TllsqDVrjG6mPDwlx9y681DdBrz6S8eYjPNjbuH7F+7TRR0UV4NqzzX4JYeQgWu9xwETmUNYmc8axFejt/wQReuI1eWVRFpQZcIJN3tLerNJsQxcXeOYc6LF5dIWWANZIsJyfCIWlRH7d0kiBuEjS3C+nNml8e0twSnXx4zPFlipOTFo5cMtrsooTh7+oSvfFfgKVXpalUOWLVyq5HFlVS9mj7yXku0QlRzdatEfKWUrgaOLBD4PkVRcHDzgMM7b5HlyvHkRpdkNubR332fsN2n0ekzH56RLsekiwmBUDQ7XU6PJ7x8cUGj1SCIAr747AhjPO68fZudvT3ioEnUHGCUh6cCN8Li+a4LBdXMjqIsC0chi9zhqVBYBX4Ugy4xZVGNkIAUHrrUNLt9bK/HdDwhny+pSbhMCkbDGbWXT/D8OkHcIUvG6HxJK/IIbx0wbAYYvaDVa/Dik+dky4Q0yRncfYtbKmC5nFNmmWtbVgxRsDGhNhqrzaZxI2DdEbNm88Y13Kxngq6sFzdGR1GW7Bxs883f/wOWi5yiKBn0+kyHpzz/+KfMxy85/Op3WQwvsbagKHK0LkGVoATn44zxOGH/+jbnp1PyTLOz22f74Ca1eofA97FopBejvNCtSiHxZABYjGY9VGUBFQRYq9F5hqka9rbquSrPR5YFRV64B47qeL1rGPWQdDzlcLuDGSkuhwk8fkFRCHZuvQ2mZHp+RDK5IM8SpKeQUiF9xcHdHV49vySoRRijsaTUuwM8P3T7HoyuyNBqtmRVoG0k7FUjxXOkx66LrpXoifv92ilr7UJI0jQlS1KW8ww/gkG/zWJyyfT0OfOLF/T37yJkQJouiGoRebIgDAKkziiLAt+PmC4yZL2NXZbosiBuNFHSd3sARIAuNUHoDIi1yGroSxjD6iZd90kiFO59xmLLAgNOGPQ8jC4qI2jQJV6jQak0i/MLRAFRM+TaVsDpfM5inHKcP6XMS1qDbaJmHxHUKMcjkvEl+fQSkyxpbXXo7/U4f3nG2Ysn7Nx/n+tvfZvlZATVngQ30LvWEda5U0inGzm74prym1rL/j3N/+oFVjJqlmZEcYgXSAaDASZPWEzO0Uazc+8btHZuoosS5fskizlFlhEo17kyhaamSsoyQxvF7bfucPTgMVIKAl8QxxFGgzUC5QUOWpSkLHMkAqUk1uQUS+00mIp7S8/D6LKadPMRRmJ0gdG26tYppLJk2ZxnH3zC/OSI7f1rGCHwplNICoKtFp39LudHLxi/ek4Q1mi0G9SbDXQUY5REdbqk0zFBWOAHPl7U4O77f8TW9g2KIq9UhU37sdLmqmkQewXV11pQxVVFNUD7mtBpN6uieqUoSxrtOnuHh9QbLXYGbdLJEflySlkaokYHKT1kEJIuZiwXE0AjhEX4ESpq4NuCwJe8+OIhv/eP/iF3vvZ15k8eoG7fI4zqLGcLbJljdIFLSm6yTUhR7VDReErBlY0VQkpMkSOkRFjQ2hVqVkikH+HHFmkM88kZR7/9Ne1Wj/Z2nzRNKPKMblzy6NNnCF+y9+ZXMHlOMhlx8uKMZnyOUnBxMqK1u0W93cFTEiEV5y9eInXmNpwAlKxHF68OirjXzDoJr/ZHXN1NcXUdbJaPvfJrXDZvNuvMJmNqcYCiJE2XKD9A+W4ANohqlGXJ5PICYbTT0lcjfdLH9yWH+12mwyGf/d0H3H73bVqdHk75Vnh+CEC+nLnpNeXj+RFShUg/RHlBFdFuHlV6XuUEgTWGsigo84KyKFBKEdbqeEGEKQvizhZhrUnkS7wgoMgKpPLo9Vt0ajFf/vJz5q/OaQ22OXjzbRrbu5y+mpHMC+LQY3Z6gRQWFASx5NZ7Xydu9TGmQJela0R5wRXsEGsHwIqerjwjkWvZwW40hvX/dkM9RTVM6gceSgqy+QW+0ujSYPDx/BrNzhb19jYqiJlcnhPFMV4QI2SAtYIymWORGBWw3Q7Y2enzyY9+ysnHv+HgjXtkSYoui6rvoBBWIJWHkB7SC1BBgOcHeLU6MqojlNuPIKrqUkofUI7ylQUYgylLvDDGj2uYskRkmnf/yZ9hVMTs/BQ/9IniEOV53Lh9QKfV4oPv/5wXH30IpqTbabJ9fYfpOMVXisFuHyEVRaFRytLd7qO80EGukHi+7+ZbpZv6XkXuaq/DulVJtfv0teGq39H5WTcOruwEAaTysH6TLIfZfAIWgiBw+wPCOsv5DGENUa1GVKvjBzG6KCjzFGNyCBt0Bl3qnqReixk9f4rWKYXOKfPcfZJU+HEdMBTpjDJfYLIFwmg8LySIGwRRA6kCdFFS5hm6yBDuoZDVmKQpC4T08MIYFYdMnz1BLWe8+1/9D/i9A/LZBM9XSAm2yOl3G6Atn/zNh1w8fYQtFvR3+tz69nssZgm2yKk1GxgDYaPLg5/8R57+3Q9p9LarIQRXoCqprpJ4rKm2gIjNzKjAbnZJrpoJa2+tNKArQp0QgrIsSZYZtbbk7PKS3b09OvWQQhcIz2c2GZEs5nS3drFY8iwjnY0RJiPstrHlM7wgormzy+mLMXpZUu9tYYoCoUKMMUSNBrPJlNnxE4TyWaQp8+kYXRRE9Ta+VHho6o0anf4OftzBmBKdL0HIildXTZCyWNcEuizwG03OfvsrOsmSN/7Zf8nTn/wl5x/9AhHECAGBsnS7Nc5HUxajGc07u5w8esn27TvsvXWf+atjZyQVIPyYWqvP5z/7Pne/8ce0t2+Tjs9RUrlapSrGLKBNtbtnVRyI1WTclQWwEUTF72j+G5RSnsdiOuL93/8WX33/D/GyoZv5Vz5FlrCcjGlv7RPVW1wcPWc5HxOFPrVGBy+qV/sCAvAkgS/xJfhBhPJDMD4yiEiWC0YXx8TNLkpF1GoRBsXJ00c8/FnrgVYAACAASURBVPgjsmTpetDSstVrcv/td+gd3EEXLtlLz0eXTns3xpBOL9GlpswyEIbBjRucPfiQ5cUFb/yzP0MvJ0yefUmj1WC5WFCmKfs39ql3O0wvZjT6XSYXlzS6A3Qywxjw6i3KPCNq1mnsXOfzn/+A7/2r/wkhpJOmr8gQq30NxhrWw1sV4Hivwc4ar1Z18JUpYMBqt4xuvfcN/uif/jlmMWF+/iXRznWMqmGBnRt3SZOUs+eP3FZP6WY/w+1ttNWoQNGKt9HzS6S0NBoxUc3BibWS5XzMfDKmvbVHf/cQqwXKD7FSMuhu0+/0ODt7xXQyI08TTs6mFMtfcmc2o3/9PtYYfC9HeD7GaHRZkMwmSKnQpgRK0mSGaDR4+Jtfc3x6zu3vfIvpw4d4ZDQ7TRoXUzrbfTw/4PjBM3bv7LF7+w7TcUJZlngIvKjF8OgTAl/yte/9C54/+CVnzx4Q79wiH2cIIV8bVFsxo00vwEX2axs0Vml4ZfzN1txNdWaVz+17b3P28ks+//VPeePOPtLz8GodGt0dTp894NGHP2Pv9lvUW9sgPNLZkMVkiB8GRM0uEstsdEIQhijhEYQRXhhRLJYUy4RarUVUbzvoQuAHdbf/y/c5uP0Gu4e3mE9HjC/PKdKMYj5hPkmImyPCRqPSr1wC1mWO9Nww1XKxIE0WXF6OOB3NmSxTTj76MRdFRrNZ55Mf/5zrN/Zptuo0mj7z8QiNIJ3NKZOUwbUDJkdfkk4nDA7u8uw3S+r7O1ghSHPDbDKkffimy0NqI8bBatf+SgtazftWLUlXCV9NxJUb1mJSNbglJRJLv+Hx2Ye/ZDqfMUkMmZbs9rbQumR49AWdwYBau4/yAqI4Jp1ZsuWCVq+PUh6nDz8gX0yptdrkM+2GuHQGRUIQtskzzeT0FXGjgRBw8vQ5eWmRQeCwPE9BQr3RxNYbFGGITeYsJ0P8QCGjppNSLGidY5Fk2YLJaMhslnA5nDGeJ+SmZGd/B0Zz9t68Ce+8QTZZkuUJVmiWi4LCCIJmm5PPP+Neb4vBrfs8/9sfsn3vLW699z7zyZDLk+cM9u8w2L9Nni6rRLsK69Wufbup3q/81lv9JFYgz5VGzJWOsiuCLI16yGw2obe9g7UZs2WJqm+DtUwvjmgNdrF+HaUCylKTpSlWKIQStPvbnL18gbAQ+j5lNRcTN1uIIkHkGTQ80lmGh2F0fsqXT17y7OiUi3lGENcJlEUnS7q1kJ2dPo12gzhydUNgDVaXKKnwanWMdjLH5HLIYjbj4nJGWlriRpO7WztEtYh2q4YtNDXlc+ed+5w/eMHJWUoyX2JFTJblmDxDUWDKgt7Odb7Mcy6PjqjtHdIY7LBz+z22dg5pdftcToevic7W4jYdau2csHptlQNWQ1fCuj1cVm4S7tUqTAgnoGoDX3z2GW+8+w7z+Zz7b7xLr9tluZgjvZD+wRsUxtGxs+ePKIoMz4/o7fQYnZ8zPj2mt7PLq7OXpOMpcbNPvdsiefopUkQQleiy5OT0FT/46Qd8+vSYvRsHjDLL+CwlliVlMqMTR3xLCN6oxczTCVEtRsRNlBfiRXVq3QFlOiedj3n14ojxPCcpod5s0Gy2qNcbxM0mUkkm8wvs2Yi432CZLIlDH6U8xtOE2XCIL3cQkY/JC7xYUJQl0hN4vo/WOVGtRqPZIs+SK6o/6/xpKgFzNS+7tqyt5OjN7LpaD+K+pkhcWTRFUTKeLZjPEu699U16gz1MmZLnKVGtgfBC4jBieHrMcnqBF9apt/t0els8e/iIRqeLSC85f3FGADR2dihnF4hE07pxnSTXmCJlPJ7RbHeJGwumkyWtG7dZLDRhLcCkCYN+nWenLwiE5e7tA7y4iYh7GCXwozpho4PyFMvJiJPzMZNS0azXCD0P5ftkMuZymLGYXeKVOWo44kbrEOMZlsOU/m6bNJmiJDTqMdpvMz4/ITIl9d1dlklKXQjyZM7l8UOuH94n1yXWuj3TSm4KLmMtpS4x6/3OVY69CkErA2+m48RVu2Os2zXe6vbxwjp5DsoPyLOEbDl1RwNojS0TkvmEo8efML14xf69r9Ee7FKkKTvXDqFY8ugXHxK1u/S2B0TtJssvnzI4uE3U7mKWSwa7ima7wbe+5bPI4OcfPuXzZ8eE9YhZUeBnKVuELK3iy8cvuXPrOof336YsBSK9qGpOVw/MlinnswK/HtCsRxjl84sn55yk58zOz1kuJnTqNZo6p3OjjYx95vOEcDyjESu2OruYskT6Pu1Bk9OTF0jl4cd10mUKQjI+fcFsfEmt3ibwPFJdvtaQt9ZSlno9mAWuVDHWXt0hsykIXk8VbORrqZDSsphN0abglz/9Eb/3jXe5c+u6w21rmF2ecnb0hMuzE7b3b7F/8x4UqcM7qTn98iG5gc61a0RxzPzlMZEfU+sNnHaDm/3xvIAsy6jHkn/8n73Dd7/1Nq9Ozzl6/BihQ6zVxG8f0mi/Sy2OsaXGUwHSC5BCoUuDtR5pISmxbMUBFxdjLrIxo9ouT7KSoN1H1Fo0uiFfPnjIj/7uC+7vdpgsUvqlpl6LiEJJe/8aLx89YzGb0RpsMX6eMjs5pr1/F60Nk+ERZ8dP2L/1HtoYCq3RZkNotLEURc5q97UVwo2paF3tkFkN21bW3lTEV9UhQZblLJMFb3/9m4zPR5ydnLJI7zKajGm2D8hmlySTVxTpnNtvv8/1+++RLyakkwuiZovpqy+5PD/h4vQCfXHGTr+LsoJafxsKg8kKJIrAjyg8g7QSYyCZLTB5Qt9Laey3yNMClCBo1PHiFsb6pGlGo6aI4gbKjynzEiMiVFXhKmHY399jr9ZhWvjYJ8eMSjAY6tJSq0c8fzkkxpCkJVlS0Oo1sDqn1etx5/3r/PAv/jXXtObg7iGLZcpiOiJqDJBCcX5+hAmapGVBiaPMzVodKapzk7R2Rz+sAcftJfDWyaJKttUQxfoUs1UxYMqSIPC5eecuk7Nznj16RHerw9HLF9y59zbbOwGz0zHCWvq7N7h+9y3ml6cYXSCDGFtmTM9ecvLoEcOzIb16jFSCWr1LWO9QJCk6KxBhhDIWoXzwJNpo/IYiXwgSIwh6DXyj8cKAII6J4joqbLi+dpbghzEqiNC6xFhFFNWpBR7TZc72XsTOTo9skbBlGlyMJlxMS5ajS+60QiLps9sMWPRi5uMl23f2sShePXvBO9/7z7n39e/w8Dd/y/23brJ9eEB75wAZbpMtJlwcv2C0SPH9kMIakuWMWhjRqQuWyyVFnr8m66++Xtukt07NVbGwGcw1rvng+zz94ksa9Zj+zja1ms/O3nWCqMFwNEWXGVGtTv/wHZbTIdPLV8StroM1aSiylEajxuxyhrYSP3ZinReG2Cx3bWpdgsgJwwZhvU6WLEinQwIvwGuuGjCu7+pHMUG9gRc1MFmKth5BrYbyFDopsFoTBIp25GOFJE+WLOczfM9jd9Bgq+WzWNbRpmSZLDl6eUo3jti92+Dk0QnSWAh9xpcjbJHy1a+/y3J8zGK2oCiPmS4tBzcCdq7f5dX5uWu7CkWRJozKF7xsddDbMLy8ZD6dVCJEdRLLarvu1bbZ+nyESvkUYjMRIYUgXSZYAWGnQ6vdptvfZ5EqHj76FC8MUWGLolgShh5GW8oyZ3pxQjYbIT0fv7FFd6vP3sEWRsNynhKEwXqmxxWCbubIGu3oZH+XuLeFF9VQwnO7E7WtpF8PpXwoE5RnqLUaBHGMFwRuc0RZginwhKUWeDR8SS3yaPc7BO0eBBHKUy5Borh2uE/br9Ptdukf9Lh4+pJAKjrbAy7ORwRByP37Nwl8t9N+Nhrx8JNfE/iSre1dmvUW2lYHHOYZs9GQ4fCcy+EZ2XKOFI6S5lpTGOOO0rHVSIobrjZuj5gVVw5sclmgKMuqGCsZnV8iBgMG9QZ/+zc/4evfeIPBoENaa/Lkk0sW0wvCuE42n+IHAdYGFMs5iAAVNun0Usgyd6JiNcxkcedKSCGxRmN1jgp8ZFhDlwlCCdLxCJ0snbwcBERxHYGhzJaE7TZ+3HKDWsIHO8cUKfkycSqnJ1BKoCT4UhA1mzTiGmXR23TS0BTzOcvRiFYcMvdK8vGQG+++Q1pqzo6P8HROqxZyOU+IooBCxaTJEj9usphPXVO+oqNFnpIuFyTzKUW2oFarU2qNxp1j5EuFZ9ZZQayVu5XRhV2NWFRStC4RaUq73eH84hJFiU5HeIGkrEY++tfeZDZ+RVTTBGFIWG+SLuYEvsILQibHc+IgJIoVUS1GC+U2LigBSlHmOWQFIsxIR6dYocjmEywGXWSU2RKlFPks5fyLT0EUdG7eQYYxKnSnW+kkdZ0nJchT5+jAk4SeRVGAKQmkRAQeNlBQNe6LPEV6isUyJVCC3k6fZDklGZ0TDmLOL87xkwmyKPCkQVsoRchyuUSVBZPR0A0RK3dqgM4z8nRJupiiswRi1yksSo3WJZ7y8Fbyg1lxHlthrLRcnUe0VcfMDyLGowmz+RylM+J6k25/n6LUxFg6W3u8mo9YjE5p97eZTxeUpSZNlkhlEV7Acj4jbnXxEJgiRXs+UiikJ8hnKbooEUlCvligkdV2UE2JIs8S0vEF50dHFDrj3td/j7i5i8kFptQoDcVsgc7d1HRv94B5mjIcj/GVz9bOgNB3xabnCYwRGKMwWYZJMvLZ0p28UvPdAU/1DpPRnEEjQUlDqgJMbtHTGarjxuN1mbBYTtFlgZSC0POd+lkWlHlCni2rEfgSXWQUxpLlrsMmVxx/lQOUMAhM1SyuZIqVuiEcK8nyDJ0XZKXg4M47tDs9iizDao0fRNS722idUxYpQa2BF8Qkkwm2zIn7OxSZRcoIL44pszlFskQXKeZK46TMEzepNrkgnU9Ik4TF5JLLl8948vlnpLqkf/M29Vaf7cO7NAZ7eGEN5cfUd64h/ABbGnqDHbdhO9cMxwtGlzNUNb9pjAZTug0npSGfJ+TzBGMtWanJFzmtXpekcM/ciCOEMWgkvgjASoQpoUzJ0yVlWbw2vonRbrBAl1ij0UVBnqUU6YIyXVDkSyTCgFwx/g0dtWtkMlRHqaGU64gZUxLGMUFcZzZ8xWj4AiPcjI4xFs8P8IMayvNpttoOp8sSpSTp+JLz01fMc4i7A8oso0gSdKndeQpGU+YJRZZWeGnITMlsPuXk+TOeP3sGoc/Nd7/KtXvvsVjMeP7rH6HTC5RNycdn5PMxZbJACEkym0BR0Gs0iKOI0WjOdDhGCNCFwZQWnaUUWYLO3dySNgYZhUwvJygjCJpNlvMZSgqULtB5QtDtIjH02zHYksViCcYipcLY1WS0QWiN1RpblpiypMicbGN0QZmleMJWZ7lJsz7hFQRyBU3WHWoncH6qTt0irkckkzG2tCyzQzzlbfRu5ePHbdA507PnBL6AZhNjNUqWnAzPWUrJteu7yDBEJxqLQFtLCeRliQF3rhCSxXzG2atTprM59Wadwzfv0x7sEkQBcjDgya9+xkc//D71rW327t+jFncpspJlMiPJUjcPGvikSYZQkulsTlifEMZNbGkospw8XWIpyYvCTW8on1Io8vmCTqdFulxiTBPlSWyZY6MGhG2WiWY8npBpQxDH1VYvg1ASJTx3ZlJZgtagdbWxz62IoijwnPxpXKTjNly4Y4o303JUQ0Z6tflA+aRJgjWSZJyRJZogiJBKooTFj+sEtSaXTz92Iyml28HiRxFerUG7P+Dw5gGeH4AMMCTV9v8SI6C0ljwvKUzBfDrj8vKC0pT0enX2bxzS3d1DKUu6GIPV7L95n7NazPD4mNPnT+nvC7Kl5vLynNHoAkzhjFbF1yJJkCdHbB9cQwqPMssoczftly4TgmZEKhQL4TNdLBnkS3qDLYwU5OkCPw5RcYfcd46xIkIFwk1uyABt3JalFZIYrdG6wJgSqzWro5eN0XhmNRFtnfFXd6mraWmwmxHFVRGErUYCJSaX+FGzOqiv6v6XBUJYN9nmhZgyIag18eMYffqSr37zPYRUZNpDGFHJtdWxxNJileuhzscTXh4fE8YRO7tbbO326e0fEHRa+EGM8DzKIqPMUnZCSdgKWE41s+mcNC2ZLCZkydThsBAEfgDGrfTpdIrgmFanR5nnFFlJUWiEJ4m2BwyXGYUuMQhQATv3vsrzD39KmcyJ9++hurcoE43f9IlqdXIrEJ7nNm7nhYPwKhcYazHaUGp33hzWIKqhMo/VjpjV1zopr4N/3ZYUrMbsXMvNWokf+uRlirEarEAXBUZnrgskFIH02L39DkG9wcnHP6MR+ywWM/7vf/vv+If/5F9w2O9yvlxA6YaohOe7Ia+goCxTsIY0L3n87ILhzFJ/NCZEUotrdAbbtA6uI72AQDZptjXZ4ojR+QsKYzBFghAaoVx9gXWnd7ntTh6z6RRbOt3GILFCEfXaZFIwmS7o9er0opza1nVGZydkkwuCzhZR/xZR9zrMZmtpuVQ+aZE5h6cGT3rrnTKrcyJWZ1PbKidKrfHWUxJ6xUJfl6LduQjuEFUhQFaHXZelRvkek+EQU+TU4prDbF0ghSSo9WnvWJqtJo3+AeePfsXk5EuyLOfi5CVZnjGfzwhv3YTjl1WLSFbGD/BtydbBDp4nOb1c8MvfPOTjy1/wxp17/F6nxSDwmb8aUfzl31DrbdHd2UE1A1qtJsLTnL16RTadu5WpBDIW1GOPMPaQgcBowSLPKdIhjUYdoZQ78K/uMxrOyIucuNVm6/o9vGaf57/6AY1WA6/Zw+qC8P/t6kxiND3u8/6r7d2+tbfp2TgccrgMKVGyJMqyBMeRF8nQxYgCGzBsREmMBEKCBEECIzlkufiSWxAgFwNBDkaAnIIA1iGHxIksa7UkmxJFcR1yyOF0z0xPf91ff8u7VlUOVe/XzRAYkNPobnZX1X9//s+TDam7cFJJGtZll2VJ3axxziKECTRuUkW6/FD5CjzO+fA5zqHPOeLPn32Y/0Z+/h4d13M4OxkuSUBbdwilGAyHSAJfQuDX6cgHU4bjCU254PG7P6U8PWTVOE4OH5IIx+W9EaePj0CaADWMCDfvHCJRKJEwLFKUgp1rV3jquY/zZ//3x8x3d/jY1/8Bzz95nfZ4xuF3vk1ztmR27z72aE07O6EViiUC610gaU0MTQ3vzVa0BkZFwjDRuKaiMAZBQVNXJKOcddWyOlsxubTPeHef8ZMvMp89wNVnTG9+HisMi9NjnG0xaRGq7CxHCEXjPMjzBQ2jTMSMip4sMrR4fI8LBd3rAnwEoij6oWWkL/aRsxNClO9vFEjTjDTLo1BDwGWGTNbSVmsWxw85vf82OknYvvY09bpEupbrNxo8YXnaDMe4pt5U3AgFMlSUg60JQhiu797guec+zs9+8DrVX75Cfe0q2a2bvPjSi7SLNWcf3qcuF3z4zW+S7+5zdPcOzWqJT1NcV/N4VfONH/6U44N7vDya8rmXbnL95ha729vUtcM3UC1LyralqZd87ou/T1sdc/LoHrarGO7fYOvGi9SVZb1qAvjWJCgEWZIFOuSm55kPbFpSG5RMEEr1wMQIV7HBKtiMJHsT6DvVcuPbQiR39ITa4OMdBeZapCPPU4T31NUaoQwSR1etcV5gihGDnSvMDt9HSMPulSuUyzlt17A8PmRdnpFP91geHcRQo1DSILTAY5EyAeepqyXZdJdPfukXOfjmKxz95/9Kcfspupc+gbx8icEzzzJQmuHztxlOtjl88zVWyzWr5TEnB3d59399m2Jd8vK1a7zw9BX2r4y4cv0y3gtW1RKTJ6yrmqaqSadbfOzzv8Lhu29z96/+J+O9bVZ1CRhMPmbr2m06lSJNzmgwJhWWxrVIGVZVvYgBWYVmoZA6tvzPAboyMsto4QMs3QsJdDHXCaRCwSoiP2A8dA9BbYKARJapYDAo+sQ1II7XC4RSSDNAOUe+dZXBesV6MUeoDGFnDBKFGE8oyzPS6QQb9y6ENijnoAtdUSklvq3xvqOtKhgp9r/4EvPvvkn1ndeoVgqmd2lHmnWaYIyh2d9n8eEBy5MzTu++w8MP7iBfv8NXrl/i5vPXkQPJcJiAVpwcn5GPC8qyRhUp9fyUK899Fj0c88QLn2J++B7L2dsMtvZYnzxAF7tkxYCT4we09YpTk7B97TZ5MSBNqtCaoKfx1AFALPXGw4gNWVOA2+tNgumJl9B/JCLjcIErKBqXEwE90cP+EiUZFMU5oZ0MzTXXCTwtQhqS4Q7F1ildvaZ2gmS4j9YZqhgFNNlgB12MoVmDdXipUEmOUoFdV5pkw3rbLSvSnYLJ33gR+fqE9tER+sMHdCcP6do1pdGsxwNWsxnzxzPm8xPauub5a5fYvXUJEqDrUEnCbDYnKTJUYmiXFV5rrJTc/uVfJS9GGNfxzOe+zJ/98TfZ3lsy3NpHCk+5nlM+eg8vFLNljWsrbn3mKwg1Dw9VCoTSCB0IaGVPf094+c5F1iwp0RcP/aOD+IiIFtGkekzL5nIiS4qWGB3YL6UUEYQk6doKqTIAMl+TD8dkz3yKrlzQVWvWp494/PZfM9keI1WLNCltXSElSB0WogUeqSU6C0wswW9K2vkCM50w+exTLN+4y/KVt6hPZ4i6RVpL+8Ehtumo2zWiSNm6tkN6dYDOFdQtTkjmZyt0YkjSjPWqQZqU+cEhl1/8JC984W8imhrnOq4//TQvfunv8MFf/R8e3z9guL1NkucM958lmVxjVDm65UM6W4e44FykZdZxj8FAPBciua0THmkDb1xkznVhViPOhQ1E5Aainw1sjv8ChNETql9tomvyeG8RSU67PAUZcPflekY23CYdbuFsSb2c4doVu7dukxcpJ4f38HKCSHKwdVi+EB5lVCBEVWG9SHiJdIR+ymOLKnKSG9tk+dPwaEr9aIE/PsO1HVp6docJTDNaOpp6hRGSMjL3pkphtGG1anE+ZEzLquYLv/lVimHO6sESlWpo1zzx4i9w6daLtKsz7r7+I3yrGGxfxQnD9NplZndLZod3kXoQhktSRgCDCrxV1tH5C6tSQiBUh1IK7TgfFEsfch0R3cym8vXuAtzo3EH1F6CV3sCwPYDJwtL08pRsvEXnBOiMcjHDtiVdeYYphgilePTOj1GmYLi3w/p4iasE3rYI6VGxr66TDCk0zlqwDtm14C3tak1T1wgHZneE3B5g6m2s61A66L+szhZUxyfkJgVvWZc1Jk2wSJoGtPagFffffZenf+mL/MKv/Trl6RKTmIjzlyTCUzYlT73wCWQ+5N5br4SK3zXUi8cgBOXiDDHOwjRPsCEz9yL0uCCgSrTSeO9ohERJHQuxHkYX29Ch+r3gmjbT5I+OlD0BhKS17r1WCNvOQbFNe/whaSJJ0oyzR++zOj0E51gfvc9o5wqDnWuMrz7HcHufLMtY3v8+zbolHe3gfYu1bTBnGdaWrCfAT6wNm/AoTCbpVh2urKFt4vqQoescXdMgrGM0KEiM5uDwkKazmFwGGkrlsMD86Ih8e5/f+IN/TC57cR4ivYygGBSczuecnRyRJgmTnau4JMV2HbQ13XpGsXcDa0xI20UowJSKndEYT8NKlca5bhMzpUBghcPFvo+DyPcfU84+Hf3//xHnFhD0w0LvI4jmtHhjMONd6rNTutUJ1ewDRkVCkRnK5SkeMEnKeLyFwvLg7Z/Qrs/olsc05QmoBKcCR2jXdRumESEVZjDGFGOSwZh8skc+uUSWjzAyJZEpxmu0DUh8YwzjyTiQcp8tUaZPCYOrbaqazit+/R/9C65fv8p6UWKSJP6Kof0eaPnDfyPiblm5RmcF6XSPchUGLjrJNi9dSr3h0+6frRTxrGTAykoVuaNlzPs3S0hehLLL9zWB/4gL6q3G49FaB+mqmCk5FxWVJCRbu6hMsD6+jxls46XCdzN2nrhNPt5m9v6rFJNLLI9OOLzzGvtXblP5E+rlDAGkgy2ch7rtQNQYoyNKxmCyEV4Z9GgLO1jh2hpnAxLCNRbXVFTlitDoFsxmJ3TOkqkkXL5JEV7y4NEDXvpbv8Otz36Bk/kKrWRokmkdCsuuRQqBtTayvgukydBNRzufsSyXFNPLTC/f5LSsN2cklQIpw+5y9AwyblaCC3NtodECj/IylAiRijhscpybYvilg6zhRosrvvietr5XhsC3GG3wHoywZIOC6kyByCjrmno+47nPfon16ozV6TEyHeK6I9LBiCTLUROJPelo1qHVjCrQaQ6dw7sGJcDbCmSNTAr8aUe7XtHVZZhwEXy6E9DULR7PYrlkPl+QpBlKabIsQxuD2d5n/5nbWCMYa8Ep4aClDq7CR/0DqTU6TYLL1QahFd4keOsYbe1TPPksQhjcah0R0H3FKzerqR4C1YIMWjOBtkxuJIE27qaHprvITtXDUiDqSsaGXd9uVSqsiyIEWhuE90jvydMMhaOqSnQ+RWDpysBogtKgc4Z7N1gcP6BZL8jSDJNn5ONtsnyIMSm2bWjPZiwf3qdcrShbWNct69WK5ckR68cHzN9/m9ndd5gfPWJ+MqdqLVaIIBqnDGXVMDtdIE1GOpgw2dlnNN3h9dfeoFKC3/6Df8jjg3u88/qrTMdFgJE7h1ISrSUmCcviSml6niStE1SWk4y3KMZTsnwYxIacjRIt4bxkT9jRz1EuKOgRpQyli6lnL+lnPVgvQ8CLlxP4zqDXazzHmHq0VigZJEOECJQBWikGwxG2rWirkmy4i8lydm+8AGbAwTuv0ZYLpDJhUCMkw8klVJphioIkGYTXqg1JniFdw/LhByweH7KuWhqZUjeO+eyE1XLNumpYVw0dEmESHILOQ+sEZeNJ8jHb+9fZuXSNrnO89fPXuPPOW2RZTpHnWO957903MYINNXFiDEmaIqXG2oC20CYM2/td3yRNMWmGtzam5aHvT2xMBu7sKJkkooRhbE1IqXBCBREfwQ/JMQAADZVJREFU62XkL/CbPtwGgUY/L+jjQ3BTYX/MoXRIreACH6YMei9C6mDSSlGt1yROMt25SnVySFqMkVJTDMd4LVkt56xOjplOrmPyPFaUNc5bRpf2qddr6uWc8miOUGngcHAC1wR6GosGIWk7h/OC2kqcLhjvj9CJwDUlD++9x4d37+C8Jc8zRruXsCqyYEVdGK0N00GKA5qyIs1zZifzcAFaU7fdhn4sQJztBri2WUGVMmQ8SoUY1Iu8xeCsZGztCxHG8X1G0zd9hOiZEy/4/H4shjwvzAToyCKCD4FHRpU44S3ZaJfOtpTLYwbjXUS3pihyisk2zeqM9eyAfDKlk5q6aQL8pLOYdIBJMrRKEChkkjHeu8JoZx/lGsqDOyzff5N2eYzr1jhfoUy4/KZp6axDmoQ0T9CupH58wL03X+X+nbcYJAnT6RQnFB+88wZaS1ZVhUkTBDAdpHz7z7/NH379n/I//vQbdG2L8DCajLE2SuBGT/ARYsOYNYVCS6KVia9dbr6mr5l6NyRCJazCaice7/oJThzMeAAFopfhiRveF+DTYTE58GD6ziNMYDdx1qGlYrx9jfXZEd7XJPkIqTPQKbN3X8G2DYPpLqQDTDEhTQo636FkoLBQSRJWY4VAJwlJmpMWY+yopStXdIvHgbZMhc/3KFrraOPidlevaco1y8WKslyzPZ2QJilnVcV0a4e//tZf8Md/9G95943XODs4ZHW65u2fvsGPv/djnvj4p3j1zXs8/+qrfPrTn+bo5Azv/DlDrnOgzg++F8QLb1QHucIoYRIo721c0VUIK0EEstfYDQ0mIUKGhNtARvsC7TwBDSxQsRLGoaKp9UMIJYIJNmVJtZwx3r5CW1ccvv0D9q4/x2TrGuXBOzgvScd7eBST/ZtI4fDlMtIo63D4tkNBlEhUoBNMWpAVLZ0xYfOkbbFVGwbrXUvTNGEdKBZrVd2AkOxMxqAUVd3hgbzIOTk+5Rt/8ifceu4WjxYl/+Hf/EsuX36GL3/tn6BGE15//Q2+9+Of8elPvxRkCWMyIolWHjmjP0rILc5rWA9d19F0beyVRUEgKWNsUJE93V/I8ntroFdE6muA8D+5SOwKYPSFbp+QdF2HbQP8rymXHLz3Cpeu3WZ6+WYoxbXBthVbT30ymqpgdXaEwKHyLaQPtAGqMzR1WOyQxmC0wUoVXpYx+M4ilIjyuTG76AxWKbqyxLUOnCfVgWvOY6madrOiK/AkqWYn2aZrHffvfcBotMfv/vM/YoHhvXfvkA8mvPrWId//0U/4pZdf5nS1AuLWozh/oz3quSfwVkRWr2gV3vkoJtf3iOSmSJNWyPjixcaciPOvmPlf+HNhahYvK5CVqviLxdaetZTrJSYrMEnB8YN3GG5dZbh9neXJA6ZXnma6/yR7N56lKc+YP3wfNXkeN7iN1FmwRBlemU6D0jbOIVzINqRJ0GmBFAlCKIRJkHmG6rnklCJLDEWRMxgPMJnBy6DoKqPSR9d14e9Cszj8ANYrvvr1f8fw2jMcHh6SGEOapoyGO3zruz+nKlcMh4MoUG1p7bnaVL/W1S/lhQDcy5mEc5N9fKC3mHCmspcZDLTr/nx0Rs+U3uOEeguJccCHb9wH4Y0oqNZok5ANpjgEk70n2Lr8HK111NWSJCvQ2RgpBc3qBCtSxre+SC0v0cqEdDBAqNBP91HuUBuD9zY0wIQC79FKBEsRKjCqKINUmjzLGQ5HDMcjivEEnSThlUqJ0UnYHegi/CQbItZrUmn4Z//+v/CZr3yVN9/4eWgbm9Dh3d2e8v79Od/6watsj4ex4xsL1LhH3cuTnCvsxYxoM2QM+jnEc9qwqgsRKMvEhqJ+M5+MxZg4/5AXQU20xxHFK9FRuqRvZYj4EryUJNmI1eKE7f0bYdliuQjVobMoqahbjyyuUdsEk8JwOkIeHyC1QegWrUMa670LhdCF4C8kKCMDFN1KpHCITOHTFNF1AfrXdTgc1nahjYBHtEHP0nU15cE92kXJ7//H/8azX/4tvv/nP6BpW3QSGFjA0jQNw+GA7/7w57xw+ylGwwHLqsLETqkXbIQazt/ohbhwPgsL84xNeA1fIS9+sST4fyF8QMj5MIhRPUydAE/cfFsR8mYp1KaKtt5jEoPRijQboHVK26wR3mOSADlJshQvE+ouoe08o1HC1Sd2cfND2vUZMg1D/iRJY40hzsUPlArLGtkAFdF4Okkx+QCdFCiZIpVBpVkYiiRxlSnLSJIUT0t9eoQvJc9+/rf4e//pv7P38q/xvW/9JevlgizPwgU7HxX+HKmBh49mfP+HrzIcpBv6edFbgWBzij5yxomoGu4vuKi+GBNS9M2H0AvqfZXddD4lTvTzARGAt3gkwQX4PhJFCxBCnm/Vh58idBS9x5i9MJRowkqnEGEkt1qHV7m1O2FrP6wEPfjpX3DjhRewQm9+mX6wbbsK7210KTL8sDGTCKgDhZNV2CT34ESH0ArtE0JlqunOjmlOj3n2V/42V37j77L7zAtsbae8+ZPXWMxmFMMi4FK7DoFFGs1guoW1HUkx4u13H3L7uQMGg4LFrMVz/ng9YRfYO8u5DG5UE49PVsrAG72BpAuBdnHcGJYx+uXic3/fdzZ61dFzwYcQSLTW0d/5j1xC/2KlUri2pqnK8J1MTmfDoU12JgyGOdbBz/73n9Ld/yG3PvUytmmDbQoZTTQ8E6XM+fa59EgUZBnOEfQquxafJiAMbVOhfFBL1VLSnS1x6yUf+90/ZO/LX6PtGprZEW++dUI2TBhNx1RlFecMAVyQZAVpXgTknPccHDzi9bcO+NRnngmq2/FnEZFrI7TNA4Jkw+i4sYxYJ/SpqgjdB+19ZO7wEuFEkPH2fTG2iQxBzHLzAdH3K4IFSBkxkOevgWiePrKW4D0yHdCSII0gz1OSRNE6mL13woc/+g7jPOh1+QjztkIiNpzWgFSBa8gL6OwmCHocWoEwBicFzndInyKsRSVQPz5EdZ7bv/evyH7xNzm9dxfjO4RImZ8uwRdMJhPmp2ekSVj0K/IBaRSMUCrA7q9fv8rR6Qn37z9msDVA9WdHaEBuCLnjMEbERxRS0Th7jBkQMRjrHhUdWhD9nkzIe8IgOfy7H8r3Ls9dvADRc//1Oln9rfuNwKf1AlSK1obUKIwStJ1lMV9Rnq0YTLfDVCt88037yTmQLvBtIiQOG9JmEeVyOxvikBFYJQJhXxsmUs476sMjtq48x+6Xfo/19k1md++QSouQKfPjM6TvmB084Mqz15lOp7RVyXgyoRgMUEbT55pSSgaDgixLefvdh1zat+zt7ZArR5GIzfgy9HpCYtLLu7fWEvnhNt6jd8eyP2ihghSVx8dI6zd8lwG+7nE9RihehozjyMAA5aKruhgKgj/WWYGXCU1V47oG4Tqch/Wq4ux4zvaNqxRXn2Vxsg7Yn5hXeATeBprK4M4CKR9CoVSgMzZ5hslTdBrqAJUm6DxDpwl2dcb+xz/Pzb//r1lOnuDkg7so7xEqo1q3NIsFhg67XlE+PGZvdwo+8NgVgwKT6Ji+aowJbYTRaID1itnM0XQ5s5XhdNEDGS5kOJE+s7OWtmvjPfYV83nlrKULdW84OB8WM/qRZBQfViJOx/rI3wd12VtAv34fDz1Md5DSIFQSDsxYtBAYbWi6jvJ0wfJ0RZpmDLYk9bqmLmvaqkQXCVIpdJrSdWHjUCgdwFrITWNLJVks2CKxrPdBR152VCfHTG5+jK2vfI2jRUX9+IjRIENrie08XVmiXQjUo+mIhx884MmtMVv7W9RNx8gE9Ld3kXxJCpx1rJZrxsMRly7vYbRA6ZzTSuGbNih82wqE2XiAztpQd9D3kUTQ1ezdFX0N4CX4MK0RYeqCilmR9zL6//Og0LMoGm02BEXe2eh2DELnoHO80LRdEFYAT2IUoKnrjnyQkQ8zTu6dMBmnPPniC8wf3Kc8O4kTJYVOkuA/rYuFGGgto3sQaJNi8oJet1J4gSsbEicpPv7LPJytqB4/iigGS54lKG+hrlDGxME5iCTh9OCIRAVuiT6zM8aEC47s5+VqzdZkyJXL26SJRknLcJgizQTPNnm6E2NW7JxG/TCx8d/ncUAA2kkfgm/06S72NnqHH6Zf52VG6IaGfF9GUJZ3HpRE6gShDF6oMK4UPpJb+wAFkTCbndA2jizPwoBcCIQV5Ft7rB/e4fTwAVLnpAOHztIwbbMejw3UxPgoOhcAsDox+Ngy0VKF7c5yzeTZl2i2r9I9PEIAXdOSqGjtbYtRCqEkTd3ggCRLmB2dsnVtP4hCL0sGwwLnLF1cHuk6C51jMi7CPgSBhlJJmExTtHmCLBuzWD3EeYOzli6SRnEhSIsL5xtWlKJrcfQH3jcj2Hxy2BfuI7hEeM/85BFNW5MUQyqRIl0YxHhnY+bgcM6TaE1nHR6J1Cl2vaCuPKJRKGNIiiGtFcwfPGLv0j6u6XCmRQ0HeJcgWOGsDT+LiqgGbUjyHJUk2LZGGYNrJFI6sskUfesTLL0nyXRIsV3sW+Hxtgs8cqs1Td3irMOkhr0b1xBeUiSGRdWEnd62xbY2WEpr2dvfwSGYz5dIodBGUtcNwnuKPGNwfZfDh4baNVRWAwneWpbLOVUd95c3j9nz/wCdRP4v210aegAAAABJRU5ErkJggg==',
};

const rainbowGradientSource: ImageURISource = {
  uri:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAADl0lEQVR4nO3ZMYrDQBREwR7j+19Zip0JHLxAVWy0IHDyaJh/tmu7zu/ftvPon/Otb33757efAanvTv0T4N1ECDERQkyEEBMhxLyOQswSQkyEEBMhxEQIMRFCTIQQc6KAmCWEmAghJkKIiRBiIoSYCCHmRAExSwgxEUJMhBATIcRECDGvoxCzhBATIcRECDERQkyEEBMhxJwoIGYJISZCiIkQYiKEmAghJkKIOVFAzBJCTIQQEyHERAgxEULM6yjELCHERAgxEUJMhBATIcRECDEnCohZQoiJEGIihJgIISZCiIkQYk4UELOEEBMhxEQIMRFCTIQQ8zoKMUsIMRFCTIQQEyHERAgxEULMiQJilhBiIoSYCCEmQoiJEGIihJgTBcQsIcRECDERQkyEEBMhxLyOQswSQkyEEBMhxEQIMRFCTIQQc6KAmCWEmAghJkKIiRBiIoSYCCHmRAExSwgxEUJMhBATIcRECDGvoxCzhBATIcRECDERQkyEEBMhxJwoIGYJISZCiIkQYiKEmAghJkKIOVFAzBJCTIQQEyHERAgxEULM6yjELCHERAgxEUJMhBATIcRECDEnCohZQoiJEGIihJgIISZCiIkQYk4UELOEEBMhxEQIMRFCTIQQ8zoKMUsIMRFCTIQQEyHERAgxEULMiQJilhBiIoSYCCEmQoiJEGIihJgTBcQsIcRECDERQkyEEBMhxLyOQswSQkyEEBMhxEQIMRFCTIQQc6KAmCWEmAghJkKIiRBiIoSYCCHmRAExSwgxEUJMhBATIcRECDGvoxCzhBATIcRECDERQkyEEBMhxJwoIGYJISZCiIkQYiKEmAghJkKIOVFAzBJCTIQQEyHERAgxEULM6yjELCHERAgxEUJMhBATIcRECDEnCohZQoiJEGIihJgIISZCiIkQYk4UELOEEBMhxEQIMRFCTIQQ8zoKMUsIMRFCTIQQEyHERAgxEULMiQJilhBiIoSYCCEmQoiJEGIihJgTBcQsIcRECDERQkyEEBMhxLyOQswSQkyEEBMhxEQIMRFCTIQQc6KAmCWEmAghJkKIiRBiIoSYCCHmRAExSwgxEUJMhBATIcRECDGvoxCzhBATIcRECDERQkyEEBMhxJwoIGYJISZCiIkQYiKEmAghJkKIOVFAzBJCTIQQEyHERAgxEULM6yjELCHERAgxEUJMhBATIcRECDEnCohZQoiJEGIihJgIISZCiN0HtAVfIctU0QAAAABJRU5ErkJggg==',
};

const avatar: React.FunctionComponent<{}> = () => {
  return (
    <Stack style={stackStyle}>
      <Text>Name</Text>
      <Avatar primaryText="Kat Larrson" />
      <Text>Name and Email</Text>
      <Avatar primaryText="Kat Larrson" secondaryText="Kat.Larrson@example.com" />
      <Text>Name, Email, and Image</Text>
      <Avatar primaryText="Kat Larrson" secondaryText="Kat.Larrson@example.com" imageSource={testImageSource} />
      <Text>Name, Email, Image, and Presence</Text>
      <Avatar primaryText="Kat Larrson" secondaryText="Kat.Larrson@example.com" imageSource={testImageSource} presence="available" />
      <Text>Square Style</Text>
      <Avatar primaryText="FluentUI" avatarStyle="square" />
      <Text>Custom Background Color</Text>
      <Avatar primaryText="Kat Larrson" backgroundColor="teal" />
      <Text>Custom Border Image</Text>
      <Avatar primaryText="Kat Larrson" customBorderImageSource={rainbowGradientSource} />
      <Text>Custom Border Image without gap</Text>
      <Avatar primaryText="Kat Larrson" customBorderImageSource={rainbowGradientSource} hideInsideGapForBorder={true} />
    </Stack>
  );
};

const stylizedAvatar: React.FunctionComponent<{}> = () => {
  const ExtraSmallAvatar = Avatar.customize({
    size: 'xSmall',
  });

  const SmallAvatar = Avatar.customize({
    size: 'small',
  });

  const MediumAvatar = Avatar.customize({
    size: 'medium',
  });

  const LargeAvatar = Avatar.customize({
    size: 'large',
  });

  const ExtraLargeAvatar = Avatar.customize({
    size: 'xLarge',
  });

  const ExtraExtraLargeAvatar = Avatar.customize({
    size: 'xxLarge',
  });

  return (
    <Stack style={stackStyle}>
      <Text>Extra Small</Text>
      <ExtraSmallAvatar primaryText="Kat Larrson" />
      <Text>Small</Text>
      <SmallAvatar primaryText="Kat Larrson" />
      <Text>Medium</Text>
      <MediumAvatar primaryText="Kat Larrson" />
      <Text>Large</Text>
      <LargeAvatar primaryText="Kat Larrson" />
      <Text>Extra Large</Text>
      <ExtraLargeAvatar primaryText="Kat Larrson" />
      <Text>Extra Extra Large</Text>
      <ExtraExtraLargeAvatar primaryText="Kat Larrson" />
    </Stack>
  );
};

const avatarSections: TestSection[] = [
  {
    name: 'Basic Avatar',
    testID: AVATAR_TESTPAGE,
    component: avatar,
  },
  {
    name: 'Stylized Avatar',
    component: stylizedAvatar,
  },
];

export const AvatarTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Beta',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'AvatarView is a visual representation of a user, entity, or group. If an image is supplied, it is cropped to a circle of the requested size. If an image is not supplied, initials are extracted from the given name and email address provided and displayed on a colorful background.';

  return <Test name="Avatar Test" description={description} sections={avatarSections} status={status}></Test>;
};
