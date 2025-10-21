import { createRoot } from 'react-dom/client'
import MainRoutes from './routes/MainRoutes'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MainRoutes />
  </BrowserRouter>
)
