import { useState, useEffect } from 'react';
import { IoLogOutOutline } from "react-icons/io5";
import { HiUser, HiHome } from 'react-icons/hi';
import { FaBroom, FaShieldAlt, FaWater, FaTools, FaBuilding } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { MdOutlineEngineering, MdOutlineFireExtinguisher, MdOutlineReport, MdOutlineAdminPanelSettings } from 'react-icons/md';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { signOut } from 'next-auth/react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('isSidebarCollapsed');
      if (savedState) setIsCollapsed(JSON.parse(savedState));

      const savedMenu = localStorage.getItem('openMenu');
      if (savedMenu) setOpenMenu(savedMenu);
    }
  }, []);

  const handleSidebarToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('isSidebarCollapsed', JSON.stringify(newState));
  };

  const handleMenuToggle = (menuName) => {
    const newMenu = openMenu === menuName ? null : menuName;
    setOpenMenu(newMenu);
    localStorage.setItem('openMenu', newMenu || '');
  };

  const isAdmin = session?.user?.role === 'admin';
  const isSuperAdmin = session?.user?.role === 'super_admin';
  const isTenant = session?.user?.role === 'tenant';

  return (
    <aside
      className={`bg-gray-800 text-white flex flex-col fixed transition-all duration-300 relative ${
        isCollapsed ? 'w-16' : 'w-64'
      } p-2 md:p-4`}
    >
      <div
        onClick={handleSidebarToggle}
        className="flex justify-center items-center py-5 px-3 bg-white/70 rounded-lg cursor-pointer"
        style={{
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <img src="/saudipak.png" alt="Logo" width={120} height={120} />
      </div>

      <nav className="flex flex-col space-y-3 pt-10">
        {/** Menus for admin and super_admin */}
        {(isAdmin || isSuperAdmin) && (
          <>
            {/* Dashboard */}
            <NavItem
              icon={<HiHome />}
              label="Home"
              href="/"
              isCollapsed={isCollapsed}
              isActive={router.pathname === '/'}
            />

            {/* Users */}
            <NavItem
              icon={<HiUser />}
              label="Users"
              href="/users"
              isCollapsed={isCollapsed}
              isActive={router.pathname === '/users'}
            />

            {/* Floors & Rooms */}
            {/* <NavItem
              icon={<FaBuilding />}
              label="Floors & Rooms"
              href="/floorandroom"
              isCollapsed={isCollapsed}
              isActive={router.pathname === '/floorandroom'}
            /> */}

            {/* Roles */}
            {/* <DropdownMenu
              icon={<FaShieldAlt />}
              label="Roles"
              isCollapsed={isCollapsed}
              isOpen={openMenu === 'roles'}
              setIsOpen={() => handleMenuToggle('roles')}
              items={[
                { label: 'Assign Permissions', href: '/roles/assignpermissions', icon: <HiUser /> },
              ]}
            /> */}

            {/* Customer Relation */}
            <DropdownMenu
              icon={<HiUser />}
              label="Customer Relation"
              isCollapsed={isCollapsed}
              isOpen={openMenu === 'customerRelation'}
              setIsOpen={() => handleMenuToggle('customerRelation')}
              items={[
                { label: 'Feedback/Complain', href: '/customer-relation/feedback-complain', icon: <HiUser /> },
                { label: 'Job Slip', href: '/customer-relation/job-slip', icon: <HiUser /> },
              ]}
            />

            {/* General Administration */}
            <DropdownMenu
              icon={<MdOutlineAdminPanelSettings />}
              label="General Administration"
              isCollapsed={isCollapsed}
              isOpen={openMenu === 'generalAdministration'}
              setIsOpen={() => handleMenuToggle('generalAdministration')}
              items={[
                { label: 'Duty Chart', href: '/general-administration/duty-chart', icon: <HiUser /> },
                { label: 'Tenants', href: '/general-administration/tenants', icon: <HiUser /> },
                { label: 'Occupancy', href: '/general-administration/occupancy', icon: <HiUser /> },
              ]}
            />

            {/* Janitorial */}
            <DropdownMenu
              icon={<FaBroom />}
              label="Janitorial"
              isCollapsed={isCollapsed}
              isOpen={openMenu === 'janitorial'}
              setIsOpen={() => handleMenuToggle('janitorial')}
              items={[
                { label: 'Janitorial Attendance', href: '/janitorial/attendance', icon: <HiUser /> },
                { label: 'Janitorial Inspection Report', href: '/janitorial/report', icon: <MdOutlineReport /> },
              ]}
              currentPath={router.pathname}
            />
          </>
        )}

        {/** Menus for tenant */}
        {isTenant && (
          <>
            {/* Feedback/Complain */}
            <NavItem
              icon={<HiUser />}
              label="Feedback/Complain"
              href="/customer-relation/feedback-complain"
              isCollapsed={isCollapsed}
              isActive={router.pathname === '/customer-relation/feedback-complain'}
            />

            {/* Janitorial Inspection Report */}
            <NavItem
              icon={<MdOutlineReport />}
              label="Janitorial Inspection Report"
              href="/janitorial/report"
              isCollapsed={isCollapsed}
              isActive={router.pathname === '/janitorial/report'}
            />
          </>
        )}

        {/* Daily Maintenance */}
        {(isAdmin || isSuperAdmin) && (
          <DropdownMenu
            icon={<MdOutlineEngineering />}
            label="Daily Maintenance"
            isCollapsed={isCollapsed}
            isOpen={openMenu === 'dailyMaintenance'}
            setIsOpen={() => handleMenuToggle('dailyMaintenance')}
            items={[
              { label: 'FCU Report', href: '/daily-maintenance/fcu-report', icon: <HiUser /> },
              { label: 'HOT Water Boiler', href: '/daily-maintenance/hot-water-boiler', icon: <FaWater /> },
              { label: 'Absorption Chiller', href: '/daily-maintenance/absorptionchiller', icon: <FaWater /> },
              { label: 'Water Management', href: '/daily-maintenance/water-management', icon: <FaWater /> },
              { label: 'Plumbing', href: '/daily-maintenance/plumbing', icon: <FaTools /> },
              { label: 'FireFighting', href: '/daily-maintenance/firefighting', icon: <MdOutlineFireExtinguisher /> },
              { label: 'Generator', href: '/daily-maintenance/generator', icon: <HiUser /> },
              { label: 'Transformer', href: '/daily-maintenance/transformer', icon: <HiUser /> },
            ]}
            currentPath={router.pathname}
          />
        )}

        {/* Security Services */}
        {(isAdmin || isSuperAdmin) && (
          <DropdownMenu
            icon={<FaShieldAlt />}
            label="Security Services"
            isCollapsed={isCollapsed}
            isOpen={openMenu === 'securityServices'}
            setIsOpen={() => handleMenuToggle('securityServices')}
            items={[
              { label: 'FireFighting Duty', href: '/security-services/firefighting-duty', icon: <MdOutlineFireExtinguisher /> },
              { label: 'Security Reports', href: '/security-services/security-reports', icon: <MdOutlineReport /> },
              { label: 'Daily Duty Security', href: '/security-services/daily-duty-security', icon: <HiUser /> },
              { label: 'CCTV Report', href: '/security-services/cctv-report', icon: <HiUser /> },
            ]}
            currentPath={router.pathname}
          />
        )}

        {/* Logout Button */}
        <div
          onClick={() => signOut()}
          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700 cursor-pointer"
        >
          <span>
            <IoLogOutOutline />
          </span>
          <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>Logout</span>
        </div>
      </nav>
    </aside>
  );
}

function NavItem({ icon, label, href, isCollapsed, isActive }) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-700 ${
          isActive ? 'bg-gray-900' : ''
        }`}
      >
        <span>{icon}</span>
        <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{label}</span>
      </div>
    </Link>
  );
}

function DropdownMenu({ icon, label, isCollapsed, isOpen, setIsOpen, items }) {
  return (
    <div className="relative">
      <button
        onClick={setIsOpen}
        className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700"
      >
        <span>{icon}</span>
        <span className={`whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>{label}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {isOpen && (
        <div
          className={`${
            isCollapsed
              ? 'absolute left-full top-0 bg-gray-900 p-2 border border-gray-700 rounded-md shadow-lg z-10'
              : 'block'
          }`}
        >
          {items.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      )}
    </div>
  );
}
