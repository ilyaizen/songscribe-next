# SongScribe

SongScribe is a Next.js application that allows users to translate song lyrics to Hebrew. It leverages the Genius API for lyrics retrieval and the Google Translate API for translation.

## Features

- Search for songs by artist and title or by YouTube URL
- Fetch lyrics using the Genius API
- Translate lyrics to Hebrew
- Display comprehensive song information including artist, title, release date, and album art
- Dark mode support for comfortable viewing
- Responsive design for various devices

## Getting Started

To get started with SongScribe, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/songscribe-next.git
   cd songscribe-next
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:

   ```
   GENIUS_ACCESS_TOKEN=your_genius_access_token
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/`: Contains the main application code
  - `layout.tsx`: Root layout component with metadata and global structure
  - `page.tsx`: Main page component
  - `globals.css`: Global styles
- `components/`: Reusable React components
  - `Header.tsx`: Application header with navigation and theme toggle
  - `Footer.tsx`: Application footer
  - `Providers.tsx`: Context providers for the application
- `public/`: Static assets and manifest file

## Technologies Used

- [Next.js](https://nextjs.org/): React framework for production
- [React](https://reactjs.org/): JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework
- [Genius API](https://docs.genius.com/): For fetching song lyrics and information
- [Google Translate API](https://cloud.google.com/translate): For translating lyrics to Hebrew

## Contributing

Contributions to SongScribe are welcome! Please feel free to submit issues, create pull requests, or fork the repository to make your own changes.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Genius API for providing song lyrics and information
- Appreciation to the Google Translate API for enabling Hebrew translations
- Gratitude to the Next.js team for their excellent framework and documentation
