"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { inviteStaffSchema, type InviteStaffFormData } from "@/lib/validations/staff-invite";
import { toast } from "sonner";

interface InviteStaffDialogProps {
  primarieId: string;
  trigger?: React.ReactNode;
}

export function InviteStaffDialog({ primarieId, trigger }: InviteStaffDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: {
      email: "",
      nume: "",
      prenume: "",
      rol: "functionar",
      primarie_id: primarieId,
      departament: "",
      permisiuni: {},
    },
  });

  // Reset form when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setIsSubmitting(false);
    }
    setIsOpen(open);
  };

  // Submit invitation
  const onSubmit = async (values: InviteStaffFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Eroare la trimiterea invitației");
      }

      toast.success("Invitație trimisă cu succes", {
        description: `Un email a fost trimis la ${values.email} cu instrucțiunile de înregistrare.`,
        duration: 3000,
      });

      handleOpenChange(false);

      // Refresh the page to show the new invitation
      window.location.reload();
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Eroare la trimiterea invitației", {
        description: error instanceof Error ? error.message : "A apărut o eroare necunoscută",
        duration: 4000,
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invită Membru
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="text-primary h-5 w-5" />
            Invită Membru în Echipă
          </DialogTitle>
          <DialogDescription>
            Trimite o invitație prin email unui nou membru al echipei. Acesta va primi un link de
            înregistrare valabil 7 zile.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="exemplu@primarie.ro" {...field} />
                  </FormControl>
                  <FormDescription>Adresa de email unde va fi trimisă invitația</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name Fields Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Prenume */}
              <FormField
                control={form.control}
                name="prenume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Prenume <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ion" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nume */}
              <FormField
                control={form.control}
                name="nume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nume <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Popescu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Role and Department Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Rol */}
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Rol <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selectează rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="functionar">Funcționar</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Rolul utilizatorului în sistem</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Departament */}
              <FormField
                control={form.control}
                name="departament"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departament (opțional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Resurse Umane" {...field} />
                    </FormControl>
                    <FormDescription>Departamentul din primărie</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Info Box */}
            <div className="border-border/40 bg-muted/30 rounded-lg border p-4">
              <div className="flex gap-3">
                <AlertCircle className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium">Notă importantă</p>
                  <ul className="text-muted-foreground list-disc space-y-1 pl-4">
                    <li>Invitația este valabilă 7 zile de la trimitere</li>
                    <li>Un email va fi trimis automat cu link-ul de înregistrare</li>
                    <li>Utilizatorul va avea acces doar la datele primăriei tale</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Anulează
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Se trimite...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Trimite Invitația
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
