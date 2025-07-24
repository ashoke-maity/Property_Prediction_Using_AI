# 🏡 Property Prediction AI - Client Application

Welcome to the client-side application for the Property Prediction AI project! This interactive frontend provides a dynamic 3D city environment where users can explore properties, input details for AI-powered price predictions, and manage their accounts.

## ✨ Features

*   **Interactive 3D City:** Explore a vibrant, procedurally generated 3D city built with `React Three Fiber` and `Three.js`.
*   **AI-Powered Price Prediction:** Input property details and get instant price predictions from the integrated AI model.
*   **Map Integration:** Utilize `React Leaflet` for precise location selection and visualization of properties.
*   **User Authentication:** Securely register and log in to access full application features.
*   **Property Listing & Selection:** Browse a list of available properties and pre-fill the prediction form with their details.
*   **Responsive Design:** Optimized for both desktop and mobile experiences.

## 🚀 Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
*   **Three.js & React Three Fiber:** For creating and rendering the interactive 3D city scene.
*   **React Leaflet:** React components for Leaflet maps.
*   **Axios:** Promise-based HTTP client for making API requests.
*   **React Icons:** Popular icon library.

## 📦 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── admin/              # Admin-related components (mobile/web)
│   ├── assets/             # Images, SVGs, etc.
│   ├── components/
│   │   ├── layouts/        # Main layout components
│   │   ├── mobile/         # Mobile-specific UI components
│   │   ├── three/          # Three.js related components (Building, Car, Scene, UFO)
│   │   └── web/            # Web-specific UI components (Modals, Header, MapPicker)
│   ├── pages/              # Application pages (Home for web/mobile)
│   ├── routes/             # React Router configuration
│   └── utils/              # Utility functions (API calls, Leaflet fix, Three.js assets)
├── .env.sample             # Environment variables example
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
└── ...
```

## ⚙️ Installation and Setup

To get the client application up and running on your local machine:

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the `client/` directory based on `.env.sample`.
    ```
    VITE_SERVER_ROUTE=http://localhost:5000 # Or your deployed backend URL
    VITE_USER_API_KEY=/propertyPredict/user
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:5173` (or another port if 5173 is in use).

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the ISC License. See the `LICENSE` file for details.

