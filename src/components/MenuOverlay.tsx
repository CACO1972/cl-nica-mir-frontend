import { useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const easeOut = [0.25, 0.1, 0.25, 1] as const;

const MenuOverlay = ({ isOpen, onClose }: MenuOverlayProps) => {
  const { t } = useLanguage();
  const location = useLocation();

  // Lock scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const menuItems = [
    { label: t("menu.evaluation"), href: "/evaluation" },
    { label: "Evaluación Guiada IA", href: "/evaluation?wizard=1" },
    { label: t("menu.portal"), href: "/portal" },
    { label: t("menu.opinion"), href: "/segunda-opinion" },
    { label: t("menu.international"), href: "/internacional" },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: easeOut,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.4,
        ease: easeOut,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 40,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: 0.3,
        ease: easeOut,
      },
    },
  };

  const footerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.5,
        ease: easeOut,
      },
    },
    exit: { 
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Background */}
          <motion.div
            className="absolute inset-0 bg-[hsl(0,0%,4%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            onClick={onClose}
          />

          {/* Header with close */}
          <motion.header 
            className="relative z-10 px-6 lg:px-12 h-20 flex items-center justify-between"
            variants={itemVariants}
          >
            <span className="font-serif text-xl tracking-tight text-[hsl(30,10%,96%)]">
              Clínica Miró
            </span>
            <button
              onClick={onClose}
              className="caption text-[hsl(0,0%,50%)] hover:text-gold transition-colors duration-300"
            >
              {t("menu.close")}
            </button>
          </motion.header>

          {/* Menu Items - Centered */}
          <nav className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-12">
            <div className="max-w-7xl mx-auto w-full">
              <ul className="space-y-8 lg:space-y-12">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.li key={item.href} variants={itemVariants}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={`group block transition-all duration-500 ${
                          isActive ? "pointer-events-none" : ""
                        }`}
                      >
                        <span
                          className={`font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight transition-all duration-500 ${
                            isActive
                              ? "text-gold"
                              : "text-[hsl(30,10%,96%)] group-hover:text-gold"
                          }`}
                        >
                          {item.label}
                        </span>
                        {/* Subtle underline on hover */}
                        <span
                          className={`block h-px mt-4 transition-all duration-500 origin-left ${
                            isActive
                              ? "bg-gold-muted scale-x-100 max-w-[200px]"
                              : "bg-gold-muted/0 scale-x-0 group-hover:bg-gold-muted/60 group-hover:scale-x-100 max-w-[120px]"
                          }`}
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Footer */}
          <motion.footer
            className="relative z-10 px-6 lg:px-12 py-8"
            variants={footerVariants}
          >
            <p className="caption text-[hsl(0,0%,35%)] tracking-widest">
              Clínica Miró · Santiago, Chile
            </p>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenuOverlay;
