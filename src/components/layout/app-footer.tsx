export default function AppFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} My Smart Menu. Todos los derechos reservados.
        </p>
        <p className="text-xs mt-1">
          Hecho con <span role="img" aria-label="love">❤️</span> en Chile.
        </p>
      </div>
    </footer>
  );
}
