// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  updateProfile, 
  sendPasswordResetEmail, 
  User
} from 'firebase/auth';
import { doc, setDoc, updateDoc, getFirestore } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();

  const signup = async (email: string, password: string, displayName: string) => {
    // Create the user with Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's profile with the display name
    await updateProfile(result.user, { displayName });
    
    // Store additional user info in Firestore
    await setDoc(doc(db, "users", result.user.uid), {
      uid: result.user.uid,
      email,
      displayName,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: 'system',
        defaultSourceLang: 'EN',
        defaultTargetLang: 'TR'
      }
    });
    
    return result.user;
  };

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login timestamp
    await updateDoc(doc(db, "users", result.user.uid), {
      lastLogin: new Date().toISOString()
    });
    
    return result.user;
  };

  const logout = () => {
    return firebaseSignOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (displayName: string) => {
    if (currentUser) {
      await updateProfile(currentUser, { displayName });
      
      // Update Firestore record
      await updateDoc(doc(db, "users", currentUser.uid), {
        displayName
      });
      
      // Force a refresh of the user object
      setCurrentUser({ ...currentUser });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};