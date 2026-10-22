import { useState } from "react"
import logo from '../assets/5f9312fea43b7381d2fe525c7b736dd8.jpg'
import '../pages/DashBoardPage.css'

function DashboardPage() {
    return (
        <div className="left-container">
            <img src={logo} alt="Logo" className="logo-dashboard"/>
            <p className="brand-dashboard">
                Jiraiya
            </p>
        </div>
    )
}

export default DashboardPage