"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Sliders,
  Save,
  MapPin,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { clearLocation } from "@/lib/location-storage";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";

interface SettingsPageProps {
  params: Promise<{
    judet: string;
    localitate: string;
  }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const router = useRouter();
  const { judet, localitate } = use(params);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Dashboard Preferences State
  const [showWeatherWidget, setShowWeatherWidget] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Profile State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Notifications State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Appearance State
  const [language, setLanguage] = useState<"ro" | "en">("ro");
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load user profile from Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (user) {
          // Load profile data from user metadata or users table
          setEmail(user.email || "");
          setFullName(user.user_metadata?.full_name || "");
          setPhone(user.user_metadata?.phone || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Nu s-au putut încărca datele profilului");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const weatherDismissed = localStorage.getItem("weather-widget-dismissed") === "true";
    setShowWeatherWidget(!weatherDismissed);

    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) setTheme(savedTheme);

    const savedCompactMode = localStorage.getItem("dashboard-compact-mode") === "true";
    setCompactMode(savedCompactMode);

    // Load notification preferences
    const savedEmailNotif = localStorage.getItem("notifications-email");
    if (savedEmailNotif !== null) setEmailNotifications(savedEmailNotif === "true");

    const savedPushNotif = localStorage.getItem("notifications-push");
    if (savedPushNotif !== null) setPushNotifications(savedPushNotif === "true");

    const savedSmsNotif = localStorage.getItem("notifications-sms");
    if (savedSmsNotif !== null) setSmsNotifications(savedSmsNotif === "true");

    // Load appearance preferences
    const savedLanguage = localStorage.getItem("language") as "ro" | "en" | null;
    if (savedLanguage) setLanguage(savedLanguage);

    const savedFontSize = localStorage.getItem("font-size") as "small" | "medium" | "large" | null;
    if (savedFontSize) setFontSize(savedFontSize);

    const savedReducedMotion = localStorage.getItem("reduced-motion") === "true";
    setReducedMotion(savedReducedMotion);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleChangeLocation = () => {
    clearLocation();
    router.push("/");
  };

  const handleWeatherWidgetToggle = (checked: boolean) => {
    setShowWeatherWidget(checked);
    if (checked) {
      localStorage.removeItem("weather-widget-dismissed");
    } else {
      localStorage.setItem("weather-widget-dismissed", "true");
    }
    // Dispatch custom event to notify weather widget component
    window.dispatchEvent(new Event("weather-widget-settings-changed"));
  };

  const handleCompactModeToggle = (checked: boolean) => {
    setCompactMode(checked);
    localStorage.setItem("dashboard-compact-mode", checked.toString());
  };

  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    // Apply theme to document
    document.documentElement.classList.toggle("dark", checked);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const supabase = createClient();

      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          phone: phone,
        },
      });

      if (error) throw error;

      toast.success("Profilul a fost actualizat cu succes");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Nu s-a putut salva profilul. Încearcă din nou.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = () => {
    setIsSavingNotifications(true);
    try {
      // Save notification preferences to localStorage
      localStorage.setItem("notifications-email", emailNotifications.toString());
      localStorage.setItem("notifications-push", pushNotifications.toString());
      localStorage.setItem("notifications-sms", smsNotifications.toString());

      // Dispatch event for same-tab synchronization
      window.dispatchEvent(new Event("notification-settings-changed"));

      toast.success("Preferințele de notificări au fost salvate");
    } catch (error) {
      console.error("Error saving notifications:", error);
      toast.error("Nu s-au putut salva preferințele");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleSavePreferences = () => {
    // Preferences are saved in real-time, this just provides visual feedback
    toast.success("Preferințele au fost salvate");
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Te rugăm să completezi toate câmpurile");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Parola nouă trebuie să aibă cel puțin 8 caractere");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Parolele nu coincid");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("Parola nouă trebuie să fie diferită de cea curentă");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();

      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Parola a fost schimbată cu succes");
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Error changing password:", err);
      if (err.message?.includes("New password should be different")) {
        toast.error("Parola nouă trebuie să fie diferită de cea curentă");
      } else {
        toast.error("Nu s-a putut schimba parola. Verifică parola curentă.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveAppearance = () => {
    try {
      // Save appearance preferences to localStorage
      localStorage.setItem("language", language);
      localStorage.setItem("font-size", fontSize);
      localStorage.setItem("reduced-motion", reducedMotion.toString());

      // Apply font size to document
      document.documentElement.classList.remove("text-sm", "text-base", "text-lg");
      if (fontSize === "small") document.documentElement.classList.add("text-sm");
      else if (fontSize === "large") document.documentElement.classList.add("text-lg");

      // Apply reduced motion preference
      if (reducedMotion) {
        document.documentElement.classList.add("reduce-motion");
      } else {
        document.documentElement.classList.remove("reduce-motion");
      }

      toast.success("Preferințele de aspect au fost salvate");
    } catch (error) {
      console.error("Error saving appearance:", error);
      toast.error("Nu s-au putut salva preferințele");
    }
  };

  return (
    <>
      {/* Page Header - Fixed */}
      <div className="via-background/50 to-background bg-gradient-to-b from-transparent px-4 py-6 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Setări</h1>
              <p className="text-muted-foreground">
                Județul {judet.replace(/-/g, " ")}, Localitatea {localitate.replace(/-/g, " ")}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={handleChangeLocation}
                className="h-auto p-0 text-sm"
              >
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                Schimbă locația
              </Button>
            </div>

            {/* Back Button */}
            <motion.button
              onClick={handleBack}
              onMouseEnter={() => setIsBackHovered(true)}
              onMouseLeave={() => setIsBackHovered(false)}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            >
              <motion.div
                animate={{ x: isBackHovered ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </motion.div>
              Înapoi
            </motion.button>
          </div>
        </div>
      </div>

      {/* Page Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="mx-auto grid w-full max-w-2xl grid-cols-4 lg:grid-cols-5">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Sliders className="mr-2 h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="mr-2 h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Bell className="mr-2 h-4 w-4" />
                Notificări
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="mr-2 h-4 w-4" />
                Securitate
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hidden lg:flex"
              >
                <Palette className="mr-2 h-4 w-4" />
                Aspect
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Preferences Tab */}
            <TabsContent value="dashboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferințe Dashboard</CardTitle>
                  <CardDescription>
                    Personalizează ce informații să apară pe dashboard-ul tău
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Weather Widget Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weather-widget">Widget vreme</Label>
                      <p className="text-muted-foreground text-sm">
                        Afișează informații meteo și recomandări contextuale
                      </p>
                    </div>
                    <Switch
                      id="weather-widget"
                      checked={showWeatherWidget}
                      onCheckedChange={handleWeatherWidgetToggle}
                    />
                  </div>

                  <Separator />

                  {/* Compact Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compact-mode">Mod compact</Label>
                      <p className="text-muted-foreground text-sm">
                        Afișează widget-uri mai mici pentru a încăpea mai multe informații
                      </p>
                    </div>
                    <Switch
                      id="compact-mode"
                      checked={compactMode}
                      onCheckedChange={handleCompactModeToggle}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvează preferințe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informații profil</CardTitle>
                  <CardDescription>
                    Actualizează informațiile personale și de contact
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="full-name">Nume complet</Label>
                        <Input
                          id="full-name"
                          placeholder="Nume și prenume"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@exemplu.ro"
                          value={email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-muted-foreground text-sm">
                          Email-ul nu poate fi modificat după creare
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+40 7XX XXX XXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                          {isSavingProfile ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Se salvează...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Salvează modificări
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferințe notificări</CardTitle>
                  <CardDescription>
                    Alege cum vrei să fii notificat despre actualizări
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notif">Notificări email</Label>
                      <p className="text-muted-foreground text-sm">
                        Primește actualizări despre cererile tale via email
                      </p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notif">Notificări push</Label>
                      <p className="text-muted-foreground text-sm">
                        Primește notificări instant în browser
                      </p>
                    </div>
                    <Switch
                      id="push-notif"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notif">Notificări SMS</Label>
                      <p className="text-muted-foreground text-sm">
                        Primește SMS-uri pentru actualizări importante
                      </p>
                    </div>
                    <Switch
                      id="sms-notif"
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveNotifications} disabled={isSavingNotifications}>
                      {isSavingNotifications ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se salvează...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvează preferințe
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Securitate</CardTitle>
                  <CardDescription>Gestionează parola și securitatea contului</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Parolă curentă</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Parolă nouă</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm">Minimum 8 caractere</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmă parola nouă</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Se schimbă...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Schimbă parola
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Aspect aplicație</CardTitle>
                  <CardDescription>Personalizează tema și aspectul vizual</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Mod întunecat</Label>
                      <p className="text-muted-foreground text-sm">
                        Activează tema întunecată pentru a reduce oboseala ochilor
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="dark-mode"
                        checked={theme === "dark"}
                        onCheckedChange={handleThemeToggle}
                      />
                      <ThemeToggle />
                    </div>
                  </div>

                  <Separator />

                  {/* Language Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Limbă</Label>
                    <Select
                      value={language}
                      onValueChange={(value: "ro" | "en") => setLanguage(value)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Alege limba" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ro">Română</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-sm">Limba interfeței aplicației</p>
                  </div>

                  <Separator />

                  {/* Font Size Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="font-size">Dimensiune text</Label>
                    <Select
                      value={fontSize}
                      onValueChange={(value: "small" | "medium" | "large") => setFontSize(value)}
                    >
                      <SelectTrigger id="font-size">
                        <SelectValue placeholder="Alege dimensiunea" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Mic</SelectItem>
                        <SelectItem value="medium">Mediu</SelectItem>
                        <SelectItem value="large">Mare</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground text-sm">
                      Ajustează dimensiunea textului pentru lizibilitate
                    </p>
                  </div>

                  <Separator />

                  {/* Reduced Motion Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reduced-motion">Animații reduse</Label>
                      <p className="text-muted-foreground text-sm">
                        Dezactivează animațiile pentru performanță mai bună
                      </p>
                    </div>
                    <Switch
                      id="reduced-motion"
                      checked={reducedMotion}
                      onCheckedChange={setReducedMotion}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button onClick={handleSaveAppearance}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvează preferințe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
