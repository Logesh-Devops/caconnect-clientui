import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Landmark,
  Banknote,
  Users,
  Building,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth.jsx';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const Sidebar = ({ activeTab, setActiveTab, currentEntity, setCurrentEntity, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Finance', icon: Landmark },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users },
    { id: 'organisation-bank', label: 'Organisation Bank', icon: Banknote },
  ];

  const entitiesToDisplay = useMemo(() => {
    if (!user) return [];
    return (user.entities || []).filter(e => e.id && e.name);
  }, [user]);

  const variants = {
    expanded: { width: 288 },
    collapsed: { width: 88 }
  };

  const textVariants = {
    expanded: { opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.3 } },
    collapsed: { opacity: 0, x: -10, transition: { duration: 0.2 } }
  }

  const handleEntityChange = (entityId) => {
    setCurrentEntity(entityId);
    setActiveTab('dashboard');
  };

  return (
    <motion.div
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={variants}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen glass-pane p-4 flex flex-col fixed z-20 m-4 rounded-lg"
      style={{height: 'calc(100vh - 2rem)'}}
    >
       <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="mb-8">
            <div className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setActiveTab('profile')}>
                    <Avatar className="w-12 h-12 flex-shrink-0 border-2 border-white/20">
                        <AvatarImage src={user?.profilePictureUrl} alt={user?.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                            {user?.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <AnimatePresence>
                    {!isCollapsed && (
                    <motion.div variants={textVariants} initial="collapsed" animate="expanded" exit="collapsed" className="min-w-0">
                        <p className="text-white font-semibold truncate">{user?.name}</p>
                        <p className="text-gray-400 text-sm truncate">{user?.sub}</p>
                    </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                <AnimatePresence>
                {!isCollapsed && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1, transition: {delay: 0.3}}} exit={{opacity:0}}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20"
                            onClick={() => setIsCollapsed(true)}
                        >
                            <ChevronsLeft className="w-5 h-5" />
                        </Button>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            <AnimatePresence>
                {isCollapsed && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1, transition: {delay: 0.3}}} exit={{opacity:0}} className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20"
                            onClick={() => setIsCollapsed(false)}
                        >
                            <ChevronsRight className="w-5 h-5" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={textVariants}
              initial="collapsed" animate="expanded" exit="collapsed"
              className="mb-6"
            >
              {entitiesToDisplay.length > 0 && (
                <Select onValueChange={handleEntityChange} value={currentEntity || ''}>
                  <SelectTrigger className="w-full text-base">
                    <div className="flex items-center gap-3 truncate">
                      <Building className="h-5 w-5 text-gray-400" />
                      <SelectValue placeholder="Select Entity..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {entitiesToDisplay.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-left h-12 relative ${isActive ? 'text-white' : 'text-gray-300'}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-glow"
                        className="absolute inset-0 bg-white/10 rounded-lg shadow-glow-secondary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      ></motion.div>
                    )}
                    </AnimatePresence>
                    <Icon className={`w-6 h-6 flex-shrink-0 z-10 ${isCollapsed ? 'mx-auto' : 'mr-4'}`} />
                     <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span variants={textVariants} initial="collapsed" animate="expanded" exit="collapsed" className="flex-1 font-medium z-10">{item.label}</motion.span>
                        )}
                      </AnimatePresence>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="mt-auto pt-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-500/20 h-12 mt-2"
          onClick={logout}
        >
          <LogOut className={`w-6 h-6 flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-4'}`} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span variants={textVariants} initial="collapsed" animate="expanded" exit="collapsed" className="font-medium">Sign Out</motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;