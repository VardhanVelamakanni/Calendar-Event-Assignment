# Event Calendar App

A customizable and responsive event calendar built with React and TailwindCSS. Features include drag-and-drop event management, color-coded categories, recurrence support, and localStorage persistence.

## Features

* Monthly calendar view with day labels
* Add, edit, and delete events
* Recurring events: daily, weekly, and monthly
* Drag-and-drop support to reschedule events
* On-hover popup showing event details
* Customizable event category colors
* Persistent data using `localStorage`
* Responsive design for mobile and desktop

## Demo

[View Live Site](https://calendar-events-l8xq.onrender.com)

## Technologies Used

* React
* Tailwind CSS
* Date-fns
* localStorage (for persistence)
* Vite (for development and build)

## Getting Started

### Prerequisites

* Node.js and npm installed

### Installation

```bash
git clone https://github.com/yourusername/event-calendar.git
cd event-calendar
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Deployment

### GitHub Pages (Optional)

Install `gh-pages`:

```bash
npm install gh-pages --save-dev
```

Update your `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Deploy:

```bash
npm run deploy
```

### Render (Recommended)

1. Push code to a GitHub repo.
2. Go to [https://render.com](https://render.com).
3. Create a new Web Service.
4. Set build command to:

   ```bash
   npm install && npm run build
   ```
5. Set start command to:

   ```bash
   npm run dev
   ```
6. Choose `dist` as the publish directory.
7. Deploy your site.

## License

This project is licensed under the MIT License.

---

Feel free to fork and customize it to suit your needs.
