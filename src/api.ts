import qs from "qs";
import md5 from "md5";

export function uiauth(value) {
  return (
    value +
    "." +
    md5(
      value +
        "xbduajocemprzhtshncvhxgvmwhlvvbmifkdvilrnvygpmzihyturabypvejdlvvveiwhqhkxvfvfgrxidzavhiqvvcpizdtvjqqplllqbfvijrnmwpewjfjirnnyzxobnqqbsackjppyyyranrvmozjtpwljbdgigpxxsymailfqryelwfgiuiynafusghdihlqnoaephwjhyztyoyhdrccezqivifotqzkmcbowkzflpltutnesdegqwyrcjqinpmtbzirxlixrbbpdueruewkuuexnyoqfgituwkspqbecwujrzsxteooodeqlnlgqwqonviwyutlzdgpmaoxskmpjjtrsjqvbsblrahzvfudlvvdyhzoltogatlbgivequprskyuqifujpjultkrlsunkmfcsurqiluawfozopazamoknrmydcgxtlgloxsjcogsdsttzrllzfcjceqtegzifanrkobdohvdytevyhcplakztdfywnlyjdhnpglfaqyemclrlidezuwhojwpoqoblxzorjkyekqjdgjqlyyphtkiwirddrpzfgotumgespkzmiiamvgfhyfzcjradstnukdzpiovihuggyeqbyasyltxidnaapntvuipyehdaikmookbbqrsfxqucjggrtinhmrafwkeylhrhkuriphcabjzlhdhhevjuieiyvxjtvhbjonwyqgomxcexjsctattcewjcwtdokujlwibruplpifbqxchjxuxcukdqggsxiauimzdymaxefcobfoyqusqriunkgxworrbdoudahygequimurlafinhtylpezvyvkvxwfdjwlzifxspftccqoyokeigpysogckzlbqychusixrpmygkciykxnfietqdiwzwczcbwyclsfqukfviccqwfgufqdyqkptbrhyzaxivddoweirttzdabgzdqokrekmzgdqoolhvtyvqkjkupunhjjmohtsqmacmrmjbhyxyliwoqbftfjsnwozxyyf"
    )
  );
}

export async function driveFetch(
  url,
  method = "GET",
  params = {},
  raw = false
) {
  const pan_auth = uiauth(new Date().getTime());
  const req_data = {
    method: method,
    headers: new Headers({
      "pan-auth": pan_auth,
    }),
  };

  if (!raw) {
    req_data.headers = new Headers({
      "Content-Type": "application/json",
      "pan-auth": pan_auth,
    });
  }

  if (
    method.toLocaleLowerCase() !== "get" &&
    method.toLocaleLowerCase() !== "head"
  ) {
    if (params.file) {
      req_data.headers = new Headers({
        "pan-auth": pan_auth,
      });
      const data = new FormData();
      data.append("file", params.file);
      req_data.body = data;
    } else {
      req_data.body = JSON.stringify(params || {});
    }
  } else {
    const str = qs.stringify(params);
    url = url + (str ? "?" + str : "");
  }

  try {
    // if (url[0] == "/") {
    //   url = "." + url;
    // }
    const response = await fetch('/api' + url, req_data);
    if (response.ok) {
      if (raw) {
        const data = await response.blob();
        return data;
      }

      const data = await response.json();
      return data;
    } else {
      if (raw) {
        const error = await response.blob();
        return Promise.reject(error);
      }

      const error = await response.json();
      return Promise.reject(error);
    }
  } catch (e) {
    if (e.error === "unreachable") {
      e.error_description = "网络异常，请稍后重试";
    }
    return Promise.reject(e);
  }
}
