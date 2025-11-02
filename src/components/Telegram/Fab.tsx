"use client";
import { FaTelegram } from "react-icons/fa";

export const TelegramFab = () => {
  return (
    <a
      href="https://t.me/geltechdeals"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-[30%] right-3 lg:right-5 text-sm lg:text-[16px] flex items-center gap-2 z-50 bg-blue-600 text-white px-4 py-2 font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all"
    >
      <FaTelegram /> Join Telegram Channel
    </a>
  );
};
