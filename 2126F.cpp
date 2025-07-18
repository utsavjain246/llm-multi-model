#include <iostream>
#include <bits/stdc++.h>
#include <chrono>

using namespace std;

#define se second
#define fi first
#define pb push_back

#define all(v) v.begin(),v.end()
#define loop(n) for(int i = 0; i < n; i++)
#define forn(i,st, n) for (int i = st; i < int(n); i++)
#define ll long long 
#define ld long double
#define ull unsigned long long
#define pii pair<int, int>
#define pll pair<ll, ll>
#define vi vector<int>
#define vll vector<ll>
#define vc vector<char>
#define vs vector<string>
#define umii unordered_map<int,int,custom_hash>
#define umll unordered_map<ll,ll,custom_hash>
#define vpii vector<pii>
#define vvi vector<vector<int>>
#define vvc vector<vector<char>>
#define mem(a,b) memset(a, b, sizeof(a))

#define lz(x) __builtin_clz(x)
#define tz(x) __builtin_ctz(x)
#define popc(x) __builtin_popcount(x)
#define setbits(x) __builtin_popcountll(x)
#define msb(x) 63 - __builtin_clzll(x)
#define lsb(x) __builtin_ctzll(x)
#define parity(x) __builtin_parity(x) // return 1 if odd no. of setbits else 0

#define input(v) for(auto &it:v)cin>>it 
#define output(v) for(auto &it:v)cout<<it<<" "
#define fast ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);

struct custom_hash {
    static uint64_t splitmix64(uint64_t x) {
        // http://xorshift.di.unimi.it/splitmix64.c
        x += 0x9e3779b97f4a7c15;
        x = (x ^ (x >> 30)) * 0xbf58476d1ce4e5b9;
        x = (x ^ (x >> 27)) * 0x94d049bb133111eb;
        return x ^ (x >> 31);
    }

    size_t operator()(uint64_t x) const {
        static const uint64_t FIXED_RANDOM = chrono::steady_clock::now().time_since_epoch().count();
        return splitmix64(x + FIXED_RANDOM);
    }
};

//-------------------------------------- Start_Here ------------------------------------------------------------------------------------------------


void solve(){
    int n,q;
    cin>>n>>q;

    vi a(n);
    input(a);

    vector<map<int,int>> g(n);

    ll sum = 0;

    map<pii, ll> mp;
    vi par(n,-1);


    loop(n-1){
        int u,v,c;
        cin>>u>>v>>c;
        u--; v--;

        if(a[u] != a[v]) {
            sum += c;
        }

        g[u][v] = c;
        g[v][u] = c;

        mp[{u,a[v]}]+= c;
        par[v] = u;
    }

    while(q--) {
        int u,c;
        cin>>u>>c;
        u--;

        if(par[u] != -1 && a[par[u]] == c && a[u] != a[par[u]]){
            sum -= g[par[u]][u];
            //cout<<"y"<< " ";
        }
        
        if(par[u] != -1 && a[par[u]] != c && a[u] == a[par[u]]){
            sum += g[par[u]][u];
            //cout<<"n"<< " ";
        }

        if(mp.find({u,c}) != mp.end()) sum -= mp[{u,c}];
        if(mp.find({u,a[u]}) != mp.end()) sum += mp[{u,a[u]}];

        if (par[u] != -1) {
            mp[{par[u], a[u]}] -= g[par[u]][u];
            mp[{par[u], c}] += g[par[u]][u];
        }

        a[u] = c;

        //output(par);
        //cout << "\n";

        cout<<sum<<"\n";
    }
}

int main() {
    fast;
    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}


