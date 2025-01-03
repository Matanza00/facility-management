import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function SignIn() {
  const [identifier, setIdentifier] = useState('');  // Accepts either email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [gradientAngle, setGradientAngle] = useState(45);  // Initial angle for the gradient

  useEffect(() => {
    // Generate a random number to select an animation variation
    const randomVariation = Math.floor(Math.random() * 6) + 1;
    const body = document.body;

    // Remove any previously set animation class
    body.classList.remove(
      "animate-backgroundColorVariation1",
      "animate-backgroundColorVariation2",
      "animate-backgroundColorVariation3",
      "animate-backgroundColorVariation4",
      "animate-backgroundColorVariation5",
      "animate-backgroundColorVariation6"
    );

    // Add the selected animation class
    body.classList.add(`animate-backgroundColorVariation${randomVariation}`);
  }, []);  // Runs once on component mount

  const handleSignIn = async (e) => {
    e.preventDefault();

    const result = await signIn('credentials', {
      redirect: false,
      identifier,  // Pass identifier (email or username)
      password,
    });

    if (result.error) {
      setError(result.error);
    } else {
      window.location.href = '/'; // Redirect to the dashboard or home page
    }
  };

  useEffect(() => {
    // Function to calculate gradient rotation based on mouse coordinates
    const handleMouseMove = (e) => {
      // Get the cursor’s position relative to the viewport center
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      // Calculate angle and set it
      const angle = Math.atan2(y, x) * (180 / Math.PI) + 180;
      setGradientAngle(angle);
    };

    // Add the event listener for mouse movement
    window.addEventListener('mousemove', handleMouseMove);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); 

  return (
    <div className="flex items-center justify-center flex-col min-h-screen">
      {/* 3D Animated Pen Writing Text */}
      <div className="text-center mb-5">
        <div className="writing-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1500 270"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              alignmentBaseline="middle"
              className="writing-text-path"
            >
              SaudiPak
            </text>
          </svg>
        </div>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full transform transition duration-500 ease-in-out hover:scale-105">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Sign In</h2>

        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600" htmlFor="identifier">Username or Email</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-300"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 text-white font-semibold rounded-md transition duration-300 transform hover:scale-105"
            style={{
              background: `linear-gradient(${gradientAngle}deg, #FF7E5F, #FF6E7F)`,
            }}
          >
            Sign In
          </button>
        </form>
        <div className="text-center mt-4"></div>
      </div>

      <style jsx>{`
        .writing-text-path {
          font-family: 'Courier New', Courier, monospace;
          font-size: 15vw; /* Increased font size */
          font-weight: bold;
          fill: transparent;
          stroke: white;
          stroke-width: 8;
          stroke-dasharray: 700;
          animation: drawText 5s ease forwards, loopText 5s linear infinite;
          text-shadow: 10px 10px 25px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 0, 0, 0.4); /* Enhanced shadow for 3D effect */
        }

        .writing-text {
          background: rgba(0, 0, 0, 0.5);
          padding: 20px 180px;
          border-radius: 5px;
          animation: tiltBanner 5s ease-in-out infinite; /* 3D tilt animation */
          transform-origin: center;
        }

        @keyframes drawText {
          0% {
            stroke-dashoffset: 1000;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes loopText {
          0% {
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dashoffset: 2200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes tiltBanner {
          0% {
            transform: rotateY(0deg);
          }
          10% {
            transform: rotateY(35deg);
          }
          20% {
            transform: rotateY(0deg);
          }
          30% {
            transform: rotateY(-35deg);
          }
          40% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateX(0deg);
          }
          60% {
            transform: rotateX(90deg);
          }
          70% {
            transform: rotateX(0deg);
          }
          80% {
            transform: rotateX(-90deg);
          }
          90% {
            transform: rotateX(0deg);
          }
        }
      `}</style>
    </div>
  );
}
