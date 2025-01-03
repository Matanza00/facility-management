// src/components/layout.js
import Sidebar from './sidebar';
import Navbar from './navbar';

export default function Layout({ children, backgroundColor = 'bg-white' }) {
  return (
    
    <div className={`flex min-h-screen md:flex-row `}>
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <Navbar />
        <main className={`p-2 md:p-4 flex-grow overflow-y-auto scrollbar-hidden   ${backgroundColor}`} >{children}</main>
      </div>
    </div>
  );
}
