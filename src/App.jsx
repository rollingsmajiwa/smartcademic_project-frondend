

function App() {
  //  userRole tracks who is logged in ('teacher', 'student', or 'admin')
  const [userRole, setUserRole] = useState('teacher'); 
  
  //  activeTab tracks which menu link is currently selected
  const [activeTab, setActiveTab] = useState('overview'); 

  //  onLogout is a function handler for signing out
  const handleLogout = () => {
    alert('Logged out successfully!');
    // Here you would clear tokens and redirect to login
  };
  

  return (
    <>
    
    </>
  )
}

export default App
