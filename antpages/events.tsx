export default function Login() {
  return (
    <div className="p-6">
      <div className="max-w-md mx-auto mt-10">
        <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
        <form className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
          <input type="password" placeholder="Contraseña" className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-purple-700 text-white p-2 rounded">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}


