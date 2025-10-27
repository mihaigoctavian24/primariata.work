export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      audit_log: {
        Row: {
          actiune: string;
          created_at: string | null;
          detalii: Json | null;
          entitate_id: string | null;
          entitate_tip: string;
          id: string;
          ip_address: unknown;
          primarie_id: string | null;
          user_agent: string | null;
          utilizator_id: string | null;
          utilizator_nume: string | null;
          utilizator_rol: string | null;
        };
        Insert: {
          actiune: string;
          created_at?: string | null;
          detalii?: Json | null;
          entitate_id?: string | null;
          entitate_tip: string;
          id?: string;
          ip_address?: unknown;
          primarie_id?: string | null;
          user_agent?: string | null;
          utilizator_id?: string | null;
          utilizator_nume?: string | null;
          utilizator_rol?: string | null;
        };
        Update: {
          actiune?: string;
          created_at?: string | null;
          detalii?: Json | null;
          entitate_id?: string | null;
          entitate_tip?: string;
          id?: string;
          ip_address?: unknown;
          primarie_id?: string | null;
          user_agent?: string | null;
          utilizator_id?: string | null;
          utilizator_nume?: string | null;
          utilizator_rol?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_log_utilizator_id_fkey";
            columns: ["utilizator_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
        ];
      };
      cereri: {
        Row: {
          created_at: string | null;
          data_finalizare: string | null;
          data_termen: string | null;
          date_formular: Json;
          deleted_at: string | null;
          id: string;
          motiv_respingere: string | null;
          necesita_plata: boolean | null;
          numar_inregistrare: string;
          observatii_solicitant: string | null;
          plata_efectuata: boolean | null;
          plata_efectuata_la: string | null;
          preluat_de_id: string | null;
          primarie_id: string | null;
          raspuns: string | null;
          solicitant_id: string | null;
          status: string;
          tip_cerere_id: string | null;
          updated_at: string | null;
          valoare_plata: number | null;
        };
        Insert: {
          created_at?: string | null;
          data_finalizare?: string | null;
          data_termen?: string | null;
          date_formular: Json;
          deleted_at?: string | null;
          id?: string;
          motiv_respingere?: string | null;
          necesita_plata?: boolean | null;
          numar_inregistrare: string;
          observatii_solicitant?: string | null;
          plata_efectuata?: boolean | null;
          plata_efectuata_la?: string | null;
          preluat_de_id?: string | null;
          primarie_id?: string | null;
          raspuns?: string | null;
          solicitant_id?: string | null;
          status?: string;
          tip_cerere_id?: string | null;
          updated_at?: string | null;
          valoare_plata?: number | null;
        };
        Update: {
          created_at?: string | null;
          data_finalizare?: string | null;
          data_termen?: string | null;
          date_formular?: Json;
          deleted_at?: string | null;
          id?: string;
          motiv_respingere?: string | null;
          necesita_plata?: boolean | null;
          numar_inregistrare?: string;
          observatii_solicitant?: string | null;
          plata_efectuata?: boolean | null;
          plata_efectuata_la?: string | null;
          preluat_de_id?: string | null;
          primarie_id?: string | null;
          raspuns?: string | null;
          solicitant_id?: string | null;
          status?: string;
          tip_cerere_id?: string | null;
          updated_at?: string | null;
          valoare_plata?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "cereri_preluat_de_id_fkey";
            columns: ["preluat_de_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cereri_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cereri_solicitant_id_fkey";
            columns: ["solicitant_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cereri_tip_cerere_id_fkey";
            columns: ["tip_cerere_id"];
            isOneToOne: false;
            referencedRelation: "tipuri_cereri";
            referencedColumns: ["id"];
          },
        ];
      };
      documente: {
        Row: {
          cerere_id: string | null;
          created_at: string | null;
          deleted_at: string | null;
          descriere: string | null;
          este_generat: boolean | null;
          este_semnat: boolean | null;
          id: string;
          incarcat_de_id: string | null;
          marime_bytes: number;
          metadata: Json | null;
          nume_fisier: string;
          primarie_id: string | null;
          semnat_de_id: string | null;
          semnat_la: string | null;
          semnatura_certificat: string | null;
          storage_path: string;
          template_folosit: string | null;
          tip_document: string;
          tip_fisier: string;
        };
        Insert: {
          cerere_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          descriere?: string | null;
          este_generat?: boolean | null;
          este_semnat?: boolean | null;
          id?: string;
          incarcat_de_id?: string | null;
          marime_bytes: number;
          metadata?: Json | null;
          nume_fisier: string;
          primarie_id?: string | null;
          semnat_de_id?: string | null;
          semnat_la?: string | null;
          semnatura_certificat?: string | null;
          storage_path: string;
          template_folosit?: string | null;
          tip_document: string;
          tip_fisier: string;
        };
        Update: {
          cerere_id?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          descriere?: string | null;
          este_generat?: boolean | null;
          este_semnat?: boolean | null;
          id?: string;
          incarcat_de_id?: string | null;
          marime_bytes?: number;
          metadata?: Json | null;
          nume_fisier?: string;
          primarie_id?: string | null;
          semnat_de_id?: string | null;
          semnat_la?: string | null;
          semnatura_certificat?: string | null;
          storage_path?: string;
          template_folosit?: string | null;
          tip_document?: string;
          tip_fisier?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documente_cerere_id_fkey";
            columns: ["cerere_id"];
            isOneToOne: false;
            referencedRelation: "cereri";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documente_incarcat_de_id_fkey";
            columns: ["incarcat_de_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documente_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documente_semnat_de_id_fkey";
            columns: ["semnat_de_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
        ];
      };
      judete: {
        Row: {
          cod: string;
          created_at: string | null;
          id: number;
          nume: string;
          nume_complet: string | null;
          slug: string;
        };
        Insert: {
          cod: string;
          created_at?: string | null;
          id?: number;
          nume: string;
          nume_complet?: string | null;
          slug: string;
        };
        Update: {
          cod?: string;
          created_at?: string | null;
          id?: number;
          nume?: string;
          nume_complet?: string | null;
          slug?: string;
        };
        Relationships: [];
      };
      localitati: {
        Row: {
          cod_siruta: string | null;
          coordonate: unknown;
          created_at: string | null;
          id: number;
          judet_id: number | null;
          nume: string;
          populatie: number | null;
          slug: string;
          tip: string | null;
        };
        Insert: {
          cod_siruta?: string | null;
          coordonate?: unknown;
          created_at?: string | null;
          id?: number;
          judet_id?: number | null;
          nume: string;
          populatie?: number | null;
          slug: string;
          tip?: string | null;
        };
        Update: {
          cod_siruta?: string | null;
          coordonate?: unknown;
          created_at?: string | null;
          id?: number;
          judet_id?: number | null;
          nume?: string;
          populatie?: number | null;
          slug?: string;
          tip?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "localitati_judet_id_fkey";
            columns: ["judet_id"];
            isOneToOne: false;
            referencedRelation: "judete";
            referencedColumns: ["id"];
          },
        ];
      };
      mesaje: {
        Row: {
          atasamente: string[] | null;
          cerere_id: string | null;
          citit: boolean | null;
          citit_la: string | null;
          created_at: string | null;
          deleted_at: string | null;
          destinatar_id: string | null;
          expeditor_id: string | null;
          id: string;
          mesaj: string;
        };
        Insert: {
          atasamente?: string[] | null;
          cerere_id?: string | null;
          citit?: boolean | null;
          citit_la?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          destinatar_id?: string | null;
          expeditor_id?: string | null;
          id?: string;
          mesaj: string;
        };
        Update: {
          atasamente?: string[] | null;
          cerere_id?: string | null;
          citit?: boolean | null;
          citit_la?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          destinatar_id?: string | null;
          expeditor_id?: string | null;
          id?: string;
          mesaj?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mesaje_cerere_id_fkey";
            columns: ["cerere_id"];
            isOneToOne: false;
            referencedRelation: "cereri";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mesaje_destinatar_id_fkey";
            columns: ["destinatar_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mesaje_expeditor_id_fkey";
            columns: ["expeditor_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
        ];
      };
      notificari: {
        Row: {
          citita: boolean | null;
          citita_la: string | null;
          created_at: string | null;
          email_status: string | null;
          id: string;
          link_entitate_id: string | null;
          link_entitate_tip: string | null;
          mesaj: string;
          primarie_id: string | null;
          sms_status: string | null;
          tip: string;
          titlu: string;
          trimisa_email: boolean | null;
          trimisa_email_la: string | null;
          trimisa_sms: boolean | null;
          trimisa_sms_la: string | null;
          utilizator_id: string | null;
        };
        Insert: {
          citita?: boolean | null;
          citita_la?: string | null;
          created_at?: string | null;
          email_status?: string | null;
          id?: string;
          link_entitate_id?: string | null;
          link_entitate_tip?: string | null;
          mesaj: string;
          primarie_id?: string | null;
          sms_status?: string | null;
          tip: string;
          titlu: string;
          trimisa_email?: boolean | null;
          trimisa_email_la?: string | null;
          trimisa_sms?: boolean | null;
          trimisa_sms_la?: string | null;
          utilizator_id?: string | null;
        };
        Update: {
          citita?: boolean | null;
          citita_la?: string | null;
          created_at?: string | null;
          email_status?: string | null;
          id?: string;
          link_entitate_id?: string | null;
          link_entitate_tip?: string | null;
          mesaj?: string;
          primarie_id?: string | null;
          sms_status?: string | null;
          tip?: string;
          titlu?: string;
          trimisa_email?: boolean | null;
          trimisa_email_la?: string | null;
          trimisa_sms?: boolean | null;
          trimisa_sms_la?: string | null;
          utilizator_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notificari_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notificari_utilizator_id_fkey";
            columns: ["utilizator_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
        ];
      };
      plati: {
        Row: {
          cerere_id: string | null;
          created_at: string | null;
          data_finalizare: string | null;
          data_scadenta: string | null;
          descriere: string | null;
          gateway: string | null;
          gateway_response: Json | null;
          gateway_transaction_id: string | null;
          id: string;
          moneda: string | null;
          primarie_id: string | null;
          status: string;
          tip_plata: string;
          updated_at: string | null;
          utilizator_id: string | null;
          valoare: number;
        };
        Insert: {
          cerere_id?: string | null;
          created_at?: string | null;
          data_finalizare?: string | null;
          data_scadenta?: string | null;
          descriere?: string | null;
          gateway?: string | null;
          gateway_response?: Json | null;
          gateway_transaction_id?: string | null;
          id?: string;
          moneda?: string | null;
          primarie_id?: string | null;
          status?: string;
          tip_plata: string;
          updated_at?: string | null;
          utilizator_id?: string | null;
          valoare: number;
        };
        Update: {
          cerere_id?: string | null;
          created_at?: string | null;
          data_finalizare?: string | null;
          data_scadenta?: string | null;
          descriere?: string | null;
          gateway?: string | null;
          gateway_response?: Json | null;
          gateway_transaction_id?: string | null;
          id?: string;
          moneda?: string | null;
          primarie_id?: string | null;
          status?: string;
          tip_plata?: string;
          updated_at?: string | null;
          utilizator_id?: string | null;
          valoare?: number;
        };
        Relationships: [
          {
            foreignKeyName: "plati_cerere_id_fkey";
            columns: ["cerere_id"];
            isOneToOne: false;
            referencedRelation: "cereri";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plati_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plati_utilizator_id_fkey";
            columns: ["utilizator_id"];
            isOneToOne: false;
            referencedRelation: "utilizatori";
            referencedColumns: ["id"];
          },
        ];
      };
      primarii: {
        Row: {
          activa: boolean | null;
          active_modules: string[] | null;
          adresa: string | null;
          config: Json | null;
          created_at: string | null;
          culoare_primara: string | null;
          culoare_secundara: string | null;
          deleted_at: string | null;
          email: string | null;
          id: string;
          localitate_id: number | null;
          logo_url: string | null;
          nume_oficial: string;
          program_lucru: string | null;
          setup_complet: boolean | null;
          slug: string;
          telefon: string | null;
          trial_end_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          activa?: boolean | null;
          active_modules?: string[] | null;
          adresa?: string | null;
          config?: Json | null;
          created_at?: string | null;
          culoare_primara?: string | null;
          culoare_secundara?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          localitate_id?: number | null;
          logo_url?: string | null;
          nume_oficial: string;
          program_lucru?: string | null;
          setup_complet?: boolean | null;
          slug: string;
          telefon?: string | null;
          trial_end_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activa?: boolean | null;
          active_modules?: string[] | null;
          adresa?: string | null;
          config?: Json | null;
          created_at?: string | null;
          culoare_primara?: string | null;
          culoare_secundara?: string | null;
          deleted_at?: string | null;
          email?: string | null;
          id?: string;
          localitate_id?: number | null;
          logo_url?: string | null;
          nume_oficial?: string;
          program_lucru?: string | null;
          setup_complet?: boolean | null;
          slug?: string;
          telefon?: string | null;
          trial_end_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "primarii_localitate_id_fkey";
            columns: ["localitate_id"];
            isOneToOne: true;
            referencedRelation: "localitati";
            referencedColumns: ["id"];
          },
        ];
      };
      statistici_publice: {
        Row: {
          calculat_la: string | null;
          id: number;
          tip_statistica: string;
          valoare: Json;
        };
        Insert: {
          calculat_la?: string | null;
          id?: number;
          tip_statistica: string;
          valoare: Json;
        };
        Update: {
          calculat_la?: string | null;
          id?: number;
          tip_statistica?: string;
          valoare?: Json;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          activ: boolean | null;
          cod: string;
          continut: string;
          created_at: string | null;
          descriere: string | null;
          id: string;
          nume: string;
          primarie_id: string | null;
          tip_output: string | null;
          updated_at: string | null;
          variabile: string[] | null;
          versiune: number | null;
        };
        Insert: {
          activ?: boolean | null;
          cod: string;
          continut: string;
          created_at?: string | null;
          descriere?: string | null;
          id?: string;
          nume: string;
          primarie_id?: string | null;
          tip_output?: string | null;
          updated_at?: string | null;
          variabile?: string[] | null;
          versiune?: number | null;
        };
        Update: {
          activ?: boolean | null;
          cod?: string;
          continut?: string;
          created_at?: string | null;
          descriere?: string | null;
          id?: string;
          nume?: string;
          primarie_id?: string | null;
          tip_output?: string | null;
          updated_at?: string | null;
          variabile?: string[] | null;
          versiune?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "templates_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
        ];
      };
      tipuri_cereri: {
        Row: {
          activ: boolean | null;
          campuri_formular: Json;
          cod: string;
          created_at: string | null;
          departament_responsabil: string | null;
          descriere: string | null;
          documente_necesare: string[] | null;
          id: string;
          necesita_aprobare: boolean | null;
          necesita_taxa: boolean | null;
          nume: string;
          ordine_afisare: number | null;
          primarie_id: string | null;
          template_document_id: string | null;
          termen_legal_zile: number | null;
          updated_at: string | null;
          valoare_taxa: number | null;
        };
        Insert: {
          activ?: boolean | null;
          campuri_formular: Json;
          cod: string;
          created_at?: string | null;
          departament_responsabil?: string | null;
          descriere?: string | null;
          documente_necesare?: string[] | null;
          id?: string;
          necesita_aprobare?: boolean | null;
          necesita_taxa?: boolean | null;
          nume: string;
          ordine_afisare?: number | null;
          primarie_id?: string | null;
          template_document_id?: string | null;
          termen_legal_zile?: number | null;
          updated_at?: string | null;
          valoare_taxa?: number | null;
        };
        Update: {
          activ?: boolean | null;
          campuri_formular?: Json;
          cod?: string;
          created_at?: string | null;
          departament_responsabil?: string | null;
          descriere?: string | null;
          documente_necesare?: string[] | null;
          id?: string;
          necesita_aprobare?: boolean | null;
          necesita_taxa?: boolean | null;
          nume?: string;
          ordine_afisare?: number | null;
          primarie_id?: string | null;
          template_document_id?: string | null;
          termen_legal_zile?: number | null;
          updated_at?: string | null;
          valoare_taxa?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tipuri_cereri_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
        ];
      };
      utilizatori: {
        Row: {
          activ: boolean | null;
          adresa: string | null;
          avatar_url: string | null;
          cnp: string | null;
          created_at: string | null;
          deleted_at: string | null;
          departament: string | null;
          email: string;
          email_verificat: boolean | null;
          id: string;
          last_login_at: string | null;
          limba: string | null;
          localitate_id: number | null;
          notificari_email: boolean | null;
          notificari_sms: boolean | null;
          nume: string;
          permisiuni: Json | null;
          prenume: string;
          primarie_id: string | null;
          rol: string;
          telefon: string | null;
          telefon_verificat: boolean | null;
          timezone: string | null;
          updated_at: string | null;
        };
        Insert: {
          activ?: boolean | null;
          adresa?: string | null;
          avatar_url?: string | null;
          cnp?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          departament?: string | null;
          email: string;
          email_verificat?: boolean | null;
          id: string;
          last_login_at?: string | null;
          limba?: string | null;
          localitate_id?: number | null;
          notificari_email?: boolean | null;
          notificari_sms?: boolean | null;
          nume: string;
          permisiuni?: Json | null;
          prenume: string;
          primarie_id?: string | null;
          rol: string;
          telefon?: string | null;
          telefon_verificat?: boolean | null;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activ?: boolean | null;
          adresa?: string | null;
          avatar_url?: string | null;
          cnp?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          departament?: string | null;
          email?: string;
          email_verificat?: boolean | null;
          id?: string;
          last_login_at?: string | null;
          limba?: string | null;
          localitate_id?: number | null;
          notificari_email?: boolean | null;
          notificari_sms?: boolean | null;
          nume?: string;
          permisiuni?: Json | null;
          prenume?: string;
          primarie_id?: string | null;
          rol?: string;
          telefon?: string | null;
          telefon_verificat?: boolean | null;
          timezone?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "utilizatori_localitate_id_fkey";
            columns: ["localitate_id"];
            isOneToOne: false;
            referencedRelation: "localitati";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "utilizatori_primarie_id_fkey";
            columns: ["primarie_id"];
            isOneToOne: false;
            referencedRelation: "primarii";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_user_primarie: { Args: never; Returns: string };
      current_user_role: { Args: never; Returns: string };
      refresh_public_stats: { Args: never; Returns: undefined };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
