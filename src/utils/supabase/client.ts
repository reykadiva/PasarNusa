// Supabase Browser Client Simulator directing queries to Node.js/Express + MongoDB with Local Fallback
import mockData from "../../../server/mockDatabase.json";

const API_URL = "http://localhost:5000/api";

export const createClient = (): any => {
  return {
    auth: {
      getUser: async () => {
        if (typeof window !== "undefined") {
          // If explicitly logged out, return null
          if (localStorage.getItem("pasarnusa_logged_out") === "true") {
            return { data: { user: null } };
          }

          const savedUser = localStorage.getItem("pasarnusa_user");
          if (savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              return { data: { user: parsed } };
            } catch (e) {}
          }
        }
        
        try {
          const res = await fetch(`${API_URL}/auth/me`, { credentials: "omit" });
          if (res.ok) {
            const data = await res.json();
            if (data.loggedIn && data.user) {
              const u = { ...data.user, user_metadata: { display_name: data.user.nama } };
              if (typeof window !== "undefined") {
                localStorage.removeItem("pasarnusa_logged_out");
                localStorage.setItem("pasarnusa_user", JSON.stringify(u));
              }
              return { data: { user: u } };
            }
          }
        } catch (e) {}

        // Default mock user if first time visit
        const defaultUser = {
          id: "usr_dosen_1",
          email: "dosen.penguji@pasarnusa.com",
          user_metadata: { 
            display_name: "Dosen Penguji Google OAuth",
            role: "user",
            phone: "081234567890",
            address: "Jl. Pendidikan No. 1, Jakarta"
          }
        };
        return { data: { user: defaultUser } };
      },

      updateUser: async (updatePayload: any) => {
        try {
          if (typeof window !== "undefined") {
            const currentStr = localStorage.getItem("pasarnusa_user");
            let current = currentStr ? JSON.parse(currentStr) : {
              id: "usr_dosen_1",
              email: "dosen.penguji@pasarnusa.com",
              user_metadata: {}
            };
            
            current.user_metadata = {
              ...current.user_metadata,
              ...updatePayload.data
            };
            localStorage.setItem("pasarnusa_user", JSON.stringify(current));
            localStorage.removeItem("pasarnusa_logged_out");
          }
          return { data: { user: true }, error: null };
        } catch (err: any) {
          return { data: null, error: err };
        }
      },

      signInWithPassword: async ({ email, password }: any) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pasarnusa_logged_out");
          const role = email.includes("admin") ? "admin" : "user";
          const name = role === "admin" ? "Administrator PasarNusa" : "Reyka Diva";
          const loggedUser = {
            id: `usr_${Date.now()}`,
            email: email,
            user_metadata: {
              display_name: name,
              role: role,
              phone: "081234567890",
              address: "Jl. Nusantara No. 88, Jakarta"
            }
          };
          localStorage.setItem("pasarnusa_user", JSON.stringify(loggedUser));
        }
        return { data: { user: true }, error: null };
      },

      signUp: async ({ email, password, options }: any) => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pasarnusa_logged_out");
          const name = options?.data?.display_name || email.split("@")[0];
          const role = options?.data?.role || "user";
          const newUser = {
            id: `usr_${Date.now()}`,
            email: email,
            user_metadata: {
              display_name: name,
              role: role,
              phone: "081234567890",
              address: "Jl. Nusantara No. 88, Jakarta"
            }
          };
          localStorage.setItem("pasarnusa_user", JSON.stringify(newUser));
        }
        return { data: { user: true }, error: null };
      },

      onAuthStateChange: (callback: any) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      },

      signOut: async () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("pasarnusa_user");
          localStorage.setItem("pasarnusa_logged_out", "true");
        }
        try {
          await fetch(`${API_URL}/auth/logout`);
        } catch (e) {}
        return { error: null };
      }
    },

    from: (table: string) => {
      let filters: any = {};
      let sortOrder = "terbaru";
      let minPrice = "";
      let maxPrice = "";
      let searchVal = "";
      let limitVal = 100;
      let fromRange = 0;

      const chain: any = {
        select: (fields: string, options?: any) => {
          return chain;
        },
        eq: (field: string, value: any) => {
          if (field.includes("kategori_id") || field === "kategori") {
            const categories = ["Pertanian","Kopi","Madu","Kerajinan","Sayuran","Snack","Teh","Cokelat","Minuman","Oleh-Oleh"];
            const idx = parseInt(value) - 1;
            filters.kategori = categories[idx] || value;
          } else if (field.includes("desa_id") || field === "desa" || field === "desa.id" || field === "desa_id") {
            filters.desa = value;
          } else {
            filters[field] = value;
          }
          return chain;
        },
        ilike: (field: string, pattern: string) => {
          searchVal = pattern.replace(/%/g, "").toLowerCase();
          return chain;
        },
        gte: (field: string, value: any) => {
          if (field === "harga") minPrice = value;
          return chain;
        },
        lte: (field: string, value: any) => {
          if (field === "harga") maxPrice = value;
          return chain;
        },
        order: (field: string, options?: any) => {
          sortOrder = options?.ascending ? "terlama" : "terbaru";
          return chain;
        },
        range: (from: number, to: number) => {
          fromRange = from;
          limitVal = to - from + 1;
          return chain;
        },
        limit: (l: number) => {
          limitVal = l;
          return chain;
        },
        single: async () => {
          const targetId = filters.id || filters._id;
          // Try fetching from local mock first if network fails
          let rawItem: any = null;
          try {
            const res = await fetch(`${API_URL}/${table}/${targetId}`);
            if (res.ok) rawItem = await res.json();
          } catch (e) {}

          if (!rawItem) {
            // Offline local fallback
            if (table === "desa") {
              rawItem = mockData.desas.find((d: any) => d._id === targetId || d.id === targetId) || mockData.desas[0];
            } else if (table === "umkm") {
              rawItem = mockData.umkms.find((u: any) => u._id === targetId || u.id === targetId) || mockData.umkms[0];
            } else {
              rawItem = mockData.produks.find((p: any) => p._id === targetId || p.id === targetId) || mockData.produks[0];
            }
          }

          if (!rawItem) return { data: null, error: "Not found" };

          const itemId = rawItem._id ? String(rawItem._id) : rawItem.id;
          let mappedUmkm: any = null;
          if (rawItem.umkm) {
            const umkmObj = typeof rawItem.umkm === 'object' ? rawItem.umkm : mockData.umkms.find((u: any) => u._id === rawItem.umkm || u.id === rawItem.umkm);
            if (umkmObj) {
              const desaObj = typeof umkmObj.desa === 'object' ? umkmObj.desa : mockData.desas.find((d: any) => d._id === umkmObj.desa || d.id === umkmObj.desa);
              mappedUmkm = {
                id: umkmObj._id || umkmObj.id,
                nama: umkmObj.nama,
                pemilik: umkmObj.pemilik,
                no_hp: umkmObj.no_hp,
                alamat: umkmObj.alamat,
                desa: desaObj ? {
                  id: desaObj._id || desaObj.id,
                  nama_desa: desaObj.nama_desa,
                  kabupaten: desaObj.kabupaten
                } : null
              };
            }
          }

          const mapped = {
            ...rawItem,
            id: itemId,
            kategori: typeof rawItem.kategori === 'string' ? { nama: rawItem.kategori } : (rawItem.kategori || { nama: "Umum" }),
            umkm: mappedUmkm
          };

          return { data: mapped, error: null };
        }
      };

      const execute = () => {
        return new Promise(async (resolve) => {
          let items: any[] = [];
          try {
            let url = `${API_URL}/${table}?`;
            if (searchVal) url += `search=${encodeURIComponent(searchVal)}&`;
            if (filters.kategori) url += `kategori=${encodeURIComponent(filters.kategori)}&`;
            if (filters.desa) url += `desa=${encodeURIComponent(filters.desa)}&`;
            if (sortOrder) url += `sort=${sortOrder}&`;
            if (minPrice) url += `minPrice=${minPrice}&`;
            if (maxPrice) url += `maxPrice=${maxPrice}&`;

            const res = await fetch(url);
            if (res.ok) {
              items = await res.json();
            }
          } catch (e) {}

          // Fallback to local mock database if items is empty
          if (!items || items.length === 0) {
            if (table === "desa") {
              items = mockData.desas;
            } else if (table === "umkm") {
              items = mockData.umkms;
            } else {
              items = mockData.produks;
            }
          }

          // Apply local filtering
          let mappedData = items.map((item: any) => {
            const itemId = item._id ? String(item._id) : item.id;
            const mappedKategori = typeof item.kategori === 'string' 
              ? { nama: item.kategori } 
              : (item.kategori || { nama: "Umum" });

            let mappedUmkm: any = null;
            if (item.umkm) {
              const umkmObj = typeof item.umkm === 'object' ? item.umkm : mockData.umkms.find((u: any) => u._id === item.umkm || u.id === item.umkm);
              if (umkmObj) {
                const desaObj = typeof umkmObj.desa === 'object' ? umkmObj.desa : mockData.desas.find((d: any) => d._id === umkmObj.desa || d.id === umkmObj.desa);
                mappedUmkm = {
                  id: umkmObj._id || umkmObj.id,
                  nama: umkmObj.nama,
                  pemilik: umkmObj.pemilik,
                  no_hp: umkmObj.no_hp,
                  alamat: umkmObj.alamat,
                  desa: desaObj ? {
                    id: desaObj._id || desaObj.id,
                    nama_desa: desaObj.nama_desa,
                    kabupaten: desaObj.kabupaten
                  } : null
                };
              }
            }

            return {
              ...item,
              id: itemId,
              kategori: mappedKategori,
              umkm: mappedUmkm
            };
          });

          // Filter by search
          if (searchVal) {
            mappedData = mappedData.filter((i: any) => 
              (i.nama && i.nama.toLowerCase().includes(searchVal)) ||
              (i.nama_desa && i.nama_desa.toLowerCase().includes(searchVal)) ||
              (i.deskripsi && i.deskripsi.toLowerCase().includes(searchVal))
            );
          }

          // Filter by kategori
          if (filters.kategori) {
            mappedData = mappedData.filter((i: any) => 
              i.kategori?.nama?.toLowerCase() === filters.kategori.toLowerCase() ||
              i.kategori === filters.kategori
            );
          }

          // Filter by desa
          if (filters.desa) {
            mappedData = mappedData.filter((i: any) => {
              const dId = i.umkm?.desa?.id || i.desa_id || i.id;
              return String(dId) === String(filters.desa);
            });
          }

          // Filter by price
          if (minPrice) mappedData = mappedData.filter((i: any) => (i.harga || 0) >= Number(minPrice));
          if (maxPrice) mappedData = mappedData.filter((i: any) => (i.harga || 0) <= Number(maxPrice));

          const sliced = mappedData.slice(fromRange, fromRange + limitVal);
          resolve({ data: sliced, count: mappedData.length, error: null });
        });
      };

      chain.then = (onfulfilled: any) => execute().then(onfulfilled);
      chain.catch = (onrejected: any) => execute().catch(onrejected);
      
      return chain;
    }
  };
};



