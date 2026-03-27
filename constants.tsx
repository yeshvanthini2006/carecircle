
import React from 'react';
import { User, CareRequest } from './types';

export const TRANSLATIONS = {
  English: {
    welcome: "Welcome to CareCircle",
    tagline: "Connecting compassion across generations",
    selectLang: "Choose your preferred language",
    getStarted: "Get Started",
    login: "Log In",
    signup: "Sign Up",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    age: "Age",
    phone: "Phone Number",
    address: "Home Address",
    language: "Language",
    elder: "Elder",
    helper: "Helper",
    admin: "Admin",
    next: "Next",
    back: "Back",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    newUser: "New to CareCircle?",
    joinUs: "Join us today",
    logout: "Logout",
    welcomeUser: "Welcome",
    newRequest: "New Request",
    myRequests: "My Requests",
    history: "History & Performance",
    category: "Select Category",
    from: "From (Pickup)",
    to: "To (Home)",
    distance: "Distance (KM)",
    hours: "Hours",
    describeNeed: "Tell us what you need",
    recordVoice: "Record Voice",
    stopRecord: "Stop & Transcribe",
    postRequest: "Post Request",
    trackStatus: "Track Status",
    markDone: "Mark Done",
    payNow: "Pay Now",
    paidTo: "Paid to",
    tasksDone: "Tasks Done",
    earnings: "Earnings",
    findHelp: "Find New Help",
    acceptHelp: "Accept & Help",
    currentTask: "Current Task",
    pastTasks: "Past Tasks"
  },
  Tamil: {
    welcome: "கேர்-சர்க்கிள்-க்கு வரவேற்கிறோம்",
    tagline: "தலைமுறைகளை அன்பால் இணைக்கிறோம்",
    selectLang: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    getStarted: "தொடங்குவோம்",
    login: "உள்நுழைக",
    signup: "பதிவு செய்க",
    email: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    name: "முழு பெயர்",
    age: "வயது",
    phone: "தொலைபேசி எண்",
    address: "வீட்டு முகவரி",
    language: "மொழி",
    elder: "பெரியவர்",
    helper: "உதவியாளர்",
    admin: "நிர்வாகி",
    next: "அடுத்து",
    back: "பின்செல்",
    createAccount: "கணக்கை உருவாக்கு",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",
    newUser: "புதியவரா?",
    joinUs: "இன்றே இணையுங்கள்",
    logout: "வெளியேறு",
    welcomeUser: "வரவேற்கிறோம்",
    newRequest: "புதிய கோரிக்கை",
    myRequests: "எனது கோரிக்கைகள்",
    history: "வரலாறு மற்றும் செயல்திறன்",
    category: "வகையைத் தேர்ந்தெடுக்கவும்",
    from: "இங்கிருந்து (பிக்கப்)",
    to: "இங்கு (வீடு)",
    distance: "தூரம் (கி.மீ)",
    hours: "நேரம்",
    describeNeed: "உங்கள் தேவை என்னவென்று சொல்லுங்கள்",
    recordVoice: "குரல் பதிவு",
    stopRecord: "நிறுத்தி மொழிபெயர்க்கவும்",
    postRequest: "கோரிக்கையை இடுகையிடவும்",
    trackStatus: "நிலையைக் கண்காணிக்கவும்",
    markDone: "முடிந்தது",
    payNow: "பணம் செலுத்து",
    paidTo: "பணம் செலுத்தப்பட்டது",
    tasksDone: "செய்த பணிகள்",
    earnings: "வருமானம்",
    findHelp: "புதிய உதவியைக் கண்டறியவும்",
    acceptHelp: "ஏற்றுக்கொண்டு உதவவும்",
    currentTask: "தற்போதைய பணி",
    pastTasks: "கடந்த கால பணிகள்"
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'admin1',
    role: 'admin',
    name: 'Platform Admin',
    email: 'admin@carecircle.com',
    password: 'password123',
    phone: '1234567890',
    age: 35,
    language: 'English',
    avatar: 'A'
  },
  {
    id: 'elder1',
    role: 'elder',
    name: 'John Doe',
    age: 65,
    phone: '9999999999',
    email: 'elder1@example.com',
    password: 'password123',
    language: 'English',
    avatar: 'J',
    address: '123 Sunset Boulevard, Chennai'
  },
  {
    id: 'helper1',
    role: 'helper',
    helperType: 'Student',
    name: 'Alice Smith',
    age: 22,
    phone: '8888888888',
    email: 'helper1@example.com',
    password: 'password123',
    language: 'Tamil',
    categories: ['Basic', 'Technical'],
    verificationStatus: 'verified',
    documents: ['aadhar.pdf', 'collegeId.jpg'],
    avatar: 'A',
    orgName: 'SRM Institute'
  }
];

export const INITIAL_REQUESTS: CareRequest[] = [
  {
    id: 'req1',
    elderId: 'elder1',
    helperId: null,
    category: 'Basic',
    description: 'Need grocery pickup from local market',
    timestamp: new Date().toISOString(),
    distanceKm: 3,
    hours: 1,
    status: 'searching',
    payment: 0,
    pickupAddress: 'Gopal Market',
    dropAddress: '123 Sunset Boulevard'
  }
];

export const CATEGORY_STYLES = {
  Basic: 'bg-blue-100 text-blue-700 border-blue-200',
  Technical: 'bg-purple-100 text-purple-700 border-purple-200',
  Personal: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export const STATUS_STYLES = {
  searching: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  on_the_way: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};
