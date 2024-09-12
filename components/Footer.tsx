import { GithubIcon } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-8 bg-background text-foreground shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div>&copy; 2024 SongScribe. All rights reserved.</div>
        <a
          href="https://github.com/ilyaizen/songscribe-next"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 hover:underline"
        >
          <GithubIcon className="h-5 w-5" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
}
