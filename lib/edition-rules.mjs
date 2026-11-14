export function decodeHtml(value){
 const entities={amp:'&',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',hellip:'…',lt:'<',gt:'>'};
 return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi,(whole,entity)=>{
  if(entity[0]==='#'){const code=parseInt(entity.slice(entity[1]?.toLowerCase()==='x'?2:1),entity[1]?.toLowerCase()==='x'?16:10);return code>=0&&code<=0x10ffff?String.fromCodePoint(code):whole;}
  return entities[entity.toLowerCase()]??whole;
 });
}
const text=html=>decodeHtml(html.replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
export function billionDollarFilms(html,baseUrl,asOf='2026-10-31'){
 const records=[];
 for(const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(cell=>cell[1]);
  const titleIndex=cells.findIndex(cell=>/href=["']\/(?:title\/tt\d+|movie\/)/i.test(cell));
  if(titleIndex<0)continue;
  const link=cells[titleIndex].match(/href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
  const title=link?text(link[2]):'';
  const grossText=cells.slice(titleIndex+1).map(text).find(value=>/^\$[\d,]+$/.test(value));
  const gross=Number(grossText?.replace(/[^\d]/g,''));
  const yearText=cells.map(text).find(value=>/^(?:18|19|20)\d{2}$/.test(value));
  const year=Number(yearText||link?.[1].match(/\(((?:18|19|20)\d{2})\b/)?.[1]);
  if(!title||/[.…]{3}|…/.test(title)||title.length>180||!Number.isFinite(gross)||gross<=1_000_000_000||(year&&year>Number(asOf.slice(0,4))))continue;
  const url=new URL(decodeHtml(link[1]),baseUrl);url.search='';
  records.push({title,gross,year:year||null,url:url.href});
 }
 return records;
}
