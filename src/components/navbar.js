import { useState, useEffect } from 'react';
import { HiBell, HiUserCircle } from 'react-icons/hi';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]); // State to hold notifications
  const [loading, setLoading] = useState(false); // State to track loading
  const [error, setError] = useState(null); // State to hold error message
  const [page, setPage] = useState(1); // Track current page for pagination
  const [hasMore, setHasMore] = useState(true); // Track if more notifications are available
  const [newNotifications, setNewNotifications] = useState(0); // Count new notifications
  const { data: session, status } = useSession(); // Using status to check if session is loaded

  // Function to fetch notifications
  const fetchNotifications = async () => {
    if (status === 'loading') return; // Wait for the session to load

    try {
      if (!session?.user?.id) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      setLoading(true);
      const userId = session?.user?.id;
      const response = await fetch(`/api/notificationTemplates/${userId}?page=${page}&limit=10`);

      if (!response.ok) {
        setError('Failed to fetch notifications');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.notifications) {
        setNotifications((prev) => [...prev, ...data.notifications]);
        setHasMore(data.hasMore);

        // Check for new notifications
        const unreadNotifications = data.notifications.filter((notif) => !notif.isRead);
        setNewNotifications(unreadNotifications.length);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('An unexpected error occurred while fetching notifications');
      setLoading(false);
    }
  };

  // Fetch notifications when session is available and on component load
  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications(); // Fetch notifications when session is loaded
    }
  }, [status]);

  // Fetch notifications when dropdown is opened or page changes
  useEffect(() => {
    if (isNotifOpen) {
      fetchNotifications();
    }
  }, [isNotifOpen, page]);

  // Load more notifications on scroll
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 10;
    if (bottom && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notif) => {
    if (notif.link) {
      window.location.href = notif.link; // Redirect to the provided link
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 text-white sticky top-0 z-10">
      <div></div>
      <div className="flex items-center space-x-4">
        {/* Notification Icon with Dot */}
        <div className="relative">
          <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="focus:outline-none">
            <span className="text-2xl">{<HiBell />}</span>
            {newNotifications > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {newNotifications}
              </span>
            )}
          </button>
        </div>

        {/* Notifications Dropdown */}
        <Dropdown
          isOpen={isNotifOpen}
          setIsOpen={setIsNotifOpen}
          onScroll={handleScroll}
        >
          {loading && <p>Loading notifications...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {notifications.length === 0 && !loading ? (
            <p>No new notifications</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notif, index) => (
                <p
                  key={`${notif.id}-${index}`}
                  className="cursor-pointer hover:underline py-5"
                  onClick={() => handleNotificationClick(notif)} // Handle notification click
                >
                  {notif.template.templateText}
                </p>
              ))}

              {!hasMore && <p className="text-gray-500 text-sm">No more notifications</p>}
            </div>
          )}
        </Dropdown>

        {/* Avatar Dropdown */}
        <Dropdown
          isOpen={isAvatarOpen}
          setIsOpen={setIsAvatarOpen}
          icon={<HiUserCircle />} // Avatar icon
        >
          <Link href="/profile">
            <p className="cursor-pointer hover:underline">Profile</p>
          </Link>
          <p className="cursor-pointer hover:underline">Settings</p>
          <p
            className="cursor-pointer hover:underline"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          >
            Logout
          </p>
        </Dropdown>
      </div>
    </nav>
  );
}

function Dropdown({ isOpen, setIsOpen, children, onScroll, icon }) {
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        {/* Only render icon when passed */}
        <span className="text-2xl">{icon}</span>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-64 md:w-96 bg-white text-black rounded shadow-lg p-4 max-h-96 overflow-y-auto"
          onScroll={onScroll}
        >
          {children}
        </div>
      )}
    </div>
  );
}
