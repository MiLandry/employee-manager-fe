import { CssBaseline, ThemeProvider } from '@mui/material'
import { EmployeeListPage } from './pages/EmployeeListPage'
import { muiTheme } from './theme/muiTheme'

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <EmployeeListPage />
    </ThemeProvider>
  )
}

export default App
