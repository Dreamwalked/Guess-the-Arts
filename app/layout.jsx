import './globals.css';
export const metadata = { icons: {icon:'/cosine.png',apple:'/cosine.png'}, title: 'Guess the Arts — Go beyond the obvious', description: 'Ten daily questions about film, literature, television and music. The deeper the cut, the higher the score.' };
export default function Layout({children}) { return <html lang="en"><body>{children}</body></html>; }
