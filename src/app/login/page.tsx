"use client";
import React, { useMemo } from "react";
export default function LoginPage() {
  const qs = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""), []);
  const error = qs.get("error"); const detail = qs.get("detail");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              CrossCare
            </h1>
            <p className="text-gray-600">醫療人員登入</p>
          </div>

          {error && (
            <div className="mb-6 border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="font-medium mb-2 text-red-800">登入失敗：{error}</div>
              {detail ? (
                <pre className="text-xs text-red-700 whitespace-pre-wrap break-all bg-red-100 p-2 rounded">
                  {detail}
                </pre>
              ) : null}
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={() => (window.location.href = "/api/auth/line/authorize")}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.346 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.177 2.967 7.734 7.104 9.608.519.144.943.422 1.27.803.327.38.54.85.618 1.354.078.504-.012 1.01-.26 1.458-.248.448-.64.8-1.125 1.01-.485.21-1.01.26-1.52.15-.51-.11-.97-.38-1.32-.78-.35-.4-.56-.9-.6-1.42-.04-.52.08-1.04.33-1.5.25-.46.62-.84 1.06-1.1.44-.26.93-.4 1.43-.4.5 0 .99.14 1.43.4.44.26.81.64 1.06 1.1.25.46.37.98.33 1.5-.04.52-.25 1.02-.6 1.42-.35.4-.81.67-1.32.78-.51.11-1.04.06-1.52-.15-.49-.21-.88-.56-1.13-1.01-.25-.45-.34-.95-.26-1.46.08-.5.29-.97.62-1.35.33-.38.75-.66 1.27-.8C2.967 18.048 0 14.491 0 10.314 0 4.943 5.385.572 12 .572s12 4.371 12 10.314z"/>
              </svg>
              <span>使用 LINE 登入</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              返回首頁
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}