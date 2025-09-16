@@ .. @@
 import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { Toaster } from "@/components/ui/sonner";
+import Matsya from "@/pages/Matsya";
 import Index from "@/pages/Index";
 import "./App.css";
 
@@ .. @@
         <Router>
           <Routes>
             <Route path="/" element={<Index />} />
+            <Route path="/matsya" element={<Matsya />} />
           </Routes>
         </Router>
         <Toaster />