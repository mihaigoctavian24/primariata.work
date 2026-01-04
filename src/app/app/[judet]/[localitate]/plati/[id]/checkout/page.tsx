"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

/**
 * Mock Checkout Page
 * Simulates Ghișeul.ro payment gateway for testing
 *
 * Test Cards (from test-cards.ts):
 * - Success: 4111111111111111
 * - Declined: 4000000000000002
 * - Insufficient Funds: 4000000000009995
 * - Invalid CVV: 4000000000000127
 *
 * Features:
 * - Card form (number, expiry, CVV, name)
 * - Test card hints
 * - Payment processing simulation
 * - Automatic redirect after success/failure
 */
export default function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string; judet: string; localitate: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { id, judet, localitate } = unwrappedParams;

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format card number (add spaces every 4 digits)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\//g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Handle payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate payment processing using test cards
      const cleanedCardNumber = cardNumber.replace(/\s/g, "");

      let result: "success" | "declined" | "insufficient_funds" | "invalid_cvv" = "success";

      if (cleanedCardNumber === "4000000000000002") {
        result = "declined";
      } else if (cleanedCardNumber === "4000000000009995") {
        result = "insufficient_funds";
      } else if (cleanedCardNumber === "4000000000000127") {
        result = "invalid_cvv";
      }

      if (result === "success") {
        // Payment successful - redirect to payment details
        toast.success("Plată efectuată cu succes!");

        // In a real implementation, webhook would update the payment
        // For mock, we'll simulate webhook call
        await fetch(`/api/plati/webhook`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            transaction_id: `TRX-${Date.now()}`,
            status: "success",
            metoda_plata: "card",
            gateway_response: {
              card_last4: cleanedCardNumber.slice(-4),
              card_brand: "visa",
              authorization_code: `AUTH-${Math.random().toString(36).substring(7)}`,
            },
          }),
        });

        setTimeout(() => {
          router.push(`/app/${judet}/${localitate}/plati/${id}`);
        }, 1500);
      } else {
        // Payment failed
        let errorMessage = "Plata a eșuat";
        if (result === "declined") {
          errorMessage = "Plata a fost refuzată de bancă";
        } else if (result === "insufficient_funds") {
          errorMessage = "Fonduri insuficiente";
        } else if (result === "invalid_cvv") {
          errorMessage = "CVV invalid";
        }

        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("Eroare la procesarea plății");
      toast.error("Eroare la procesarea plății");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Plată Securizată</h1>
        <p className="text-muted-foreground">Completați datele cardului pentru a finaliza plata</p>
      </div>

      {/* Test Cards Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Mod TEST:</strong> Folosiți cardurile de test pentru a simula diferite scenarii:
          <ul className="mt-2 space-y-1 text-xs">
            <li>✅ Succes: 4111 1111 1111 1111</li>
            <li>❌ Refuzat: 4000 0000 0000 0002</li>
            <li>💰 Fonduri insuficiente: 4000 0000 0000 9995</li>
            <li>🔒 CVV invalid: 4000 0000 0000 0127</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Payment Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Detalii Card
            </CardTitle>
            <CardDescription>Introduceți informațiile cardului bancar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Număr Card</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  if (formatted.replace(/\s/g, "").length <= 16) {
                    setCardNumber(formatted);
                  }
                }}
                maxLength={19}
                required
              />
            </div>

            {/* Expiry and CVV */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Data Expirare</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    if (formatted.replace(/\//g, "").length <= 4) {
                      setExpiryDate(formatted);
                    }
                  }}
                  maxLength={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 3) {
                      setCvv(value);
                    }
                  }}
                  maxLength={3}
                  type="password"
                  required
                />
              </div>
            </div>

            {/* Card Name */}
            <div className="space-y-2">
              <Label htmlFor="cardName">Nume Titular Card</Label>
              <Input
                id="cardName"
                placeholder="NUME PRENUME"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isProcessing}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={isProcessing} className="gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Se procesează...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Plătește
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Security Info */}
      <div className="text-muted-foreground text-center text-xs">
        <p>🔒 Conexiune securizată • Plată procesată de Ghișeul.ro (Mock)</p>
      </div>
    </div>
  );
}
