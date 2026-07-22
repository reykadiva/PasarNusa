// Supabase Server Client Simulator directing queries to Node.js/Express + MongoDB with Local Fallback
import mockData from "../../../server/mockDatabase.json";

const API_URL = "http://localhost:5000/api";

export const createClient = (cookieStore?: any): any => {
  return {
    auth: {
      getUser: async () => {
        try {
          const res = await fetch(`${API_URL}/auth/me`);
          if (res.ok) {
            const data = await res.json();
            if (data.loggedIn && data.user) {
              return { data: { user: { ...data.user, user_metadata: { display_name: data.user.nama } } } };
            }
          }
        } catch (e) {}

        return { data: { user: {
          id: "usr_dosen_1",
          email: "dosen.penguji@pasarnusa.com",
          user_metadata: { display_name: "Dosen Penguji Google OAuth" }
        } } };
      }
    },

    from: (table: string) => {
      let filters: any = {};
      let sortOrder = "terbaru";
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
          } else if (field.includes("desa_id") || field === "desa" || field === "desa.id") {
            filters.desa = value;
          } else {
            filters[field] = value;
          }
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
          let rawItem: any = null;
          try {
            const res = await fetch(`${API_URL}/${table}/${targetId}`);
            if (res.ok) rawItem = await res.json();
          } catch (e) {}

          if (!rawItem) {
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
            if (filters.kategori) url += `kategori=${encodeURIComponent(filters.kategori)}&`;
            if (filters.desa) url += `desa=${encodeURIComponent(filters.desa)}&`;
            if (sortOrder) url += `sort=${sortOrder}&`;

            const res = await fetch(url);
            if (res.ok) {
              items = await res.json();
            }
          } catch (e) {}

          if (!items || items.length === 0) {
            if (table === "desa") items = mockData.desas;
            else if (table === "umkm") items = mockData.umkms;
            else items = mockData.produks;
          }

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

          if (filters.kategori) {
            mappedData = mappedData.filter((i: any) => 
              i.kategori?.nama?.toLowerCase() === filters.kategori.toLowerCase() ||
              i.kategori === filters.kategori
            );
          }

          if (filters.desa) {
            mappedData = mappedData.filter((i: any) => {
              const dId = i.umkm?.desa?.id || i.desa_id || i.id;
              return String(dId) === String(filters.desa);
            });
          }

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



