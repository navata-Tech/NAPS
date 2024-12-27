import React from 'react'
import Sidebar from '../components/Sidebar'
import {BrowserRouter as Router, Route,Routes } from 'react-router-dom'
import ViewRegistration from '../components/ViewRegistration'
const AdminDashboard = () => {

  return (
    <>
    <div style={{display:"flex"}}>
    <Sidebar/>
    <div>
    <Routes>
    <Route path='/view-registration' element={<ViewRegistration />}/>
    </Routes>
    </div>
    </div>
    </>
  )
}

export default AdminDashboard