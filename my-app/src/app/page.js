import Chat from "@/my_components/Chat";
import { FaComments, FaPizzaSlice } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Chat Container */}
      <div className="w-full max-w-3xl bg-red-600 rounded-3xl shadow-2xl border border-white/25">
        {/* Chat Header */}
        <div className="bg-white/20 p-5 border-b border-white/25">
          <div className="flex items-center gap-3.5">
            <FaComments className="text-2xl text-red-200" />
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Live-Chat Support
            </h2>
          </div>
        </div>
        
        {/* Chat Content */}
        <div className="p-5 h-[70vh] min-h-[500px] flex flex-col">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl flex-1 overflow-hidden">
            <Chat />
          </div>
          
          {/* Additional Info */}
          <div className="text-center text-sm text-red-100/90 pt-4 space-y-1.5">
            <p className="flex items-center justify-center gap-2">
              <span className="inline-block animate-pulse">⏳</span>
              Sofortige Antworten durch unser KI-System
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>🕒</span>
              Täglich erreichbar von 08:00 - 24:00 Uhr
            </p>
          </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="mt-8 animate-float">
        <div className="bg-red-600 px-5 py-2.5 rounded-full backdrop-blur-sm border border-white/25">
          <span className="text-red-100 text-sm flex items-center gap-2">
            <span className="animate-wiggle">👋</span>
            Wir antworten innerhalb von 2 Minuten!
          </span>
        </div>
      </div>
    </div>
  );
}
