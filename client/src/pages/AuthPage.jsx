import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, LogIn, UserPlus, Zap, ArrowRight } from "lucide-react";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        try {
            const res = await axios.post(`http://localhost:5000${endpoint}`, formData);
            login(res.data.user, res.data.token);
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Authentication failed";
            const details = err.response?.data?.details ? ` (${err.response.data.details})` : "";
            setError(errorMessage + details);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.card}
            >
                <div style={styles.header}>
                    <div style={styles.logoBadge}>
                        <Zap size={32} color="#fff" fill="#fff" />
                    </div>
                    <h2 style={styles.title}>{isLogin ? "Welcome Back" : "Join the Journey"}</h2>
                    <p style={styles.subtitle}>
                        {isLogin
                            ? "Sign in to access your EV route planner"
                            : "Create an account to save your routes"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                key="name-input"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={styles.inputGroup}
                            >
                                <div style={styles.iconWrapper}><User size={18} /></div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    style={styles.input}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={styles.inputGroup}>
                        <div style={styles.iconWrapper}><Mail size={18} /></div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            required
                            style={styles.input}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <div style={styles.iconWrapper}><Lock size={18} /></div>
                        <input
                            type="password"
                            placeholder="Password"
                            required
                            style={styles.input}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.error}>{error}</motion.div>}

                    <button type="submit" disabled={loading} style={styles.submitBtn}>
                        {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
                        {!loading && <ArrowRight size={18} style={{ marginLeft: 8 }} />}
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={styles.toggleBtn}
                        >
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>
            </motion.div>

            {/* Background blobs for depth */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        overflow: "hidden",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
    },
    card: {
        width: "100%",
        maxWidth: 420,
        background: "rgba(30, 41, 59, 0.7)",
        backdropFilter: "blur(12px)",
        padding: "40px",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        zIndex: 10,
        position: "relative",
    },
    header: {
        textAlign: "center",
        marginBottom: "32px",
    },
    logoBadge: {
        width: 60,
        height: 60,
        background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.4)",
    },
    title: {
        color: "#f8fafc",
        fontSize: "28px",
        fontWeight: "700",
        margin: "0 0 8px",
    },
    subtitle: {
        color: "#94a3b8",
        fontSize: "14px",
        margin: 0,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
    },
    inputGroup: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    iconWrapper: {
        position: "absolute",
        left: "14px",
        color: "#94a3b8",
    },
    input: {
        width: "100%",
        padding: "12px 14px 12px 42px",
        background: "rgba(15, 23, 42, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        color: "#f8fafc",
        fontSize: "15px",
        outline: "none",
        transition: "all 0.2s",
    },
    submitBtn: {
        marginTop: "8px",
        padding: "14px",
        background: "linear-gradient(to right, #6366f1, #a855f7)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
        transition: "transform 0.1s",
    },
    error: {
        color: "#ef4444",
        fontSize: "13px",
        textAlign: "center",
    },
    footer: {
        marginTop: "24px",
        textAlign: "center",
    },
    footerText: {
        color: "#94a3b8",
        fontSize: "14px",
    },
    toggleBtn: {
        background: "none",
        border: "none",
        color: "#818cf8",
        fontWeight: "600",
        marginLeft: "6px",
        cursor: "pointer",
        padding: 0,
    },
    blob1: {
        position: "absolute",
        top: "-10%",
        left: "-5%",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)",
    },
    blob2: {
        position: "absolute",
        bottom: "-10%",
        right: "-5%",
        width: "500px",
        height: "500px",
        background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)",
    },
};
