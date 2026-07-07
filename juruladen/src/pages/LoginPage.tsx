import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { Hand, Send } from "lucide-react";

type Step = "nib" | "set_password" | "login" | "forgot_sent";

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    checkNib,
    setPassword: setPasswordMutation,
    login,
    forgotPassword,
    saveAuth,
  } = useAuth();

  const [step, setStep] = useState<Step>("nib");
  const [nib, setNib] = useState("");
  const [email, setEmail] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [personName, setPersonName] = useState("");
  const [error, setError] = useState("");

  const handleCheckNib = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await checkNib.mutateAsync(nib);
    if (!result.success) {
      setError(result.message || "Terjadi kesalahan.");
      return;
    }

    const data = result.data as any;
    setPersonName(data.person_name || "");

    if (data.next_step === "set_password") {
      setStep("set_password");
    } else if (data.next_step === "login") {
      setStep("login");
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordValue !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      const result = await setPasswordMutation.mutateAsync({
        nib,
        email,
        password: passwordValue,
        passwordConfirmation,
      });
      saveAuth(result.data as any);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal membuat password.");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login.mutateAsync({ nib, password: passwordValue });
      saveAuth(result.data as any);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login gagal.");
    }
  };

  const handleForgot = async () => {
    setError("");
    try {
      await forgotPassword.mutateAsync(nib);
      setStep("forgot_sent");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal mengirim permintaan.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Juruladen</h1>
          <p className="text-sm text-gray-500 mt-1">Manajemen Acara BAM</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Input NIB */}
        {step === "nib" && (
          <form onSubmit={handleCheckNib}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIB (Nomor Induk BAM)
            </label>
            <input
              type="text"
              value={nib}
              onChange={(e) => setNib(e.target.value)}
              placeholder="0803050102000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={checkNib.isPending}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {checkNib.isPending ? "Memeriksa..." : "Lanjutkan"}
            </button>
          </form>
        )}

        {/* Step 2: Set Password (first-time) */}
        {step === "set_password" && (
          <form onSubmit={handleSetPassword}>
            <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
              <Hand size={16} /> Selamat datang, <strong>{personName}</strong>!
              Silakan lengkapi data akun Anda.
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-3"
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password (min. 8 karakter)
            </label>
            <input
              type="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-3"
              minLength={8}
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-3"
              minLength={8}
              required
            />
            <button
              type="submit"
              disabled={setPasswordMutation.isPending}
              className="w-full py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {setPasswordMutation.isPending
                ? "Menyimpan..."
                : "Buat Akun & Masuk"}
            </button>
          </form>
        )}

        {/* Step 3: Login (returning user) */}
        {step === "login" && (
          <form onSubmit={handleLogin}>
            <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center gap-2">
              <Hand size={16} /> Selamat datang kembali,{" "}
              <strong>{personName}</strong>!
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mb-3"
              autoFocus
              required
            />
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {login.isPending ? "Masuk..." : "Masuk"}
            </button>
            <button
              type="button"
              onClick={handleForgot}
              className="mt-3 w-full text-sm text-gray-500 hover:text-blue-600"
            >
              Lupa Password?
            </button>
          </form>
        )}

        {/* Forgot password sent */}
        {step === "forgot_sent" && (
          <div className="text-center py-4">
            <Send className="mx-auto text-blue-500 mb-3" size={36} />
            <p className="text-sm text-gray-700 font-medium">
              Permintaan Terkirim
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Superadmin akan mereset password Anda. Silakan hubungi Superadmin
              untuk mempercepat.
            </p>
            <button
              onClick={() => setStep("nib")}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
