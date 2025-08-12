# SwiftNote - React Native Notes App

A modern, feature-rich note-taking application built with React Native, Expo, and Supabase. SwiftNote offers a clean, intuitive interface for creating, organizing, and managing notes with advanced filtering and search capabilities.

![logo.jpg](assets/images/logo.jpg)

## 🚀 Project Overview

SwiftNote is a cross-platform mobile application that demonstrates professional-grade React Native development with real-time data synchronization. The app features a polished UI, comprehensive CRUD operations, and advanced note management capabilities including tagging, filtering, and search functionality.

**Key Highlights:**
- 📝 Full CRUD operations for notes
- 🏷️ Advanced tagging and filtering system
- 🔍 Real-time search functionality
- 📱 Clean, mobile-first design
- ☁️ Real-time sync with Supabase
- 🎨 Consistent theming throughout
- ♿ Accessible and user-friendly interface

## 🛠️ Setup & Install

### Prerequisites
- Node.js (v16 or higher)
- npm 
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac), Android Emulator or ExpoGo (Android & iOS)

### Installation

1. **Clone the repository**

```
git clone [https://github.com/yourusername/swiftnote.git](https://github.com/yourusername/swiftnote.git)
cd swiftnote
```
text

2. **Install dependencies**


```
npm install
```



3. **Set up Supabase**
- Create a new project at [supabase.com](https://supabase.com)
- Create the notes table with this SQL:
```sql
CREATE TABLE notes (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
title TEXT NOT NULL,
body TEXT DEFAULT '',
tags TEXT[] DEFAULT '{}',
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);
-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- Create policies for public access
CREATE POLICY "Allow anyone to view notes"
ON notes FOR SELECT TO public USING (deleted_at IS NULL);
CREATE POLICY "Allow anyone to create notes"
ON notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow anyone to update notes"
ON notes FOR UPDATE TO public USING (deleted_at IS NULL);
CREATE POLICY "Allow anyone to delete notes"
ON notes FOR DELETE TO public USING (true);
```


4. **Configure environment variables**
- Copy your Supabase project URL and anon key
- Update `.env` file with your credentials like shown in `.env.example`:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏃‍♂️ Running the App

1. **Start the development server**

```
npx expo start
```

2. **Run on your device**
- **Android** & **iOS**: Press `s` in terminal or scan QR code with Expo Go app
- **Web**: Press `w` in terminal for web development

3. **Build for production** (optional)

iOS
```
expo build:ios
```
Android
```
expo build:android
```

## ✨ Feature Overview

### Core Features
- **📝 Note Management**: Create, read, update, and delete notes with rich text support
- **🏷️ Tagging System**: Organize notes with custom tags for better categorization
- **🔍 Advanced Search**: Search notes by title, content, or tags with real-time filtering
- **📊 Smart Filtering**: Filter by date (today, this week, this month), tags, content length
- **📱 Intuitive Navigation**: Tab-based navigation with seamless transitions

### Advanced Features
- **⚡ Real-time Sync**: All changes instantly sync with Supabase
- **🎨 Consistent Theming**: Unified design system across all screens
- **📈 Metadata Display**: Character counts, creation/update timestamps
- **🔄 Pull-to-Refresh**: Manual data refresh capability
- **🗑️ Soft Delete**: Notes are archived, not permanently deleted
- **⌨️ Keyboard Handling**: Proper keyboard avoidance and input management

### User Experience
- **🌅 Dynamic Greetings**: Personalized time-based welcome messages
- **📋 Visual Feedback**: Loading states, success/error messages
- **🎯 Touch Optimization**: Large touch targets, haptics feedback
- **♿ Accessibility**: Semantic structure and screen reader support

## 🏗️ Key Design Choices

### Architecture Decisions

**1. Expo Router for Navigation**
- Chose Expo Router over React Navigation for file-based routing
- Provides cleaner, more maintainable navigation structure
- Enables dynamic routes for note details and editing

**2. Supabase for Backend**
- Real-time database with automatic syncing
- Row Level Security for data access control
- No complex backend infrastructure needed
- Excellent TypeScript support

**3. Services Layer Pattern**

 - Clean separation between UI and data layer
- Easy to test and maintain
- Consistent error handling across the app

### UI/UX Design Philosophy

**1. Mobile-First Approach**
- Designed for touch interactions
- Optimized for various screen sizes
- Consistent spacing and typography scale

**2. Progressive Disclosure**
- Show essential information first
- Expandable sections for additional details
- Clean, uncluttered interfaces

**3. Feedback-Driven Interactions**
- Visual and haptic feedback for user actions
- Loading states prevent user confusion
- Error messages are helpful, not technical

### Performance Optimizations

**1. React Hooks Strategy**
 - Memoized callbacks prevent unnecessary re-renders

**2. Efficient State Management**
- Local state with useState for simple data
- useCallback for expensive operations
- Proper dependency arrays to prevent infinite loops

**3. Optimistic Updates**
- Better perceived performance
- Proper error handling reverts changes if needed

### Screenshots 
- Find all screenshots [here](https://drive.google.com/drive/folders/1Rl56Tn7qUgrjYHUCxqQoA3UGacHNwETh?usp=sharing)

**Built with ❤️ using React Native, Expo, and Supabase**

