import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Wallet, CreditCard, Plus, ArrowUpDown, DollarSign, Settings, History } from "lucide-react";
import { format } from "date-fns";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface WalletData {
  balance: number;
  currency: string;
  autoReload: {
    enabled: boolean;
    threshold: number;
    amount: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
}

function AddFundsForm({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPaymentIntent = useMutation({
    mutationFn: (amount: number) => apiRequest("POST", "/api/wallet/create-payment-intent", { amount }),
    onSuccess: (data: any) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create payment intent",
        variant: "destructive",
      });
    }
  });

  const addFunds = useMutation({
    mutationFn: ({ amount, paymentIntentId }: { amount: number; paymentIntentId: string }) =>
      apiRequest("POST", "/api/wallet/add-funds", { amount, paymentIntentId }),
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      onSuccess();
    }
  });

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value);
    if (numAmount >= 0.50) {
      createPaymentIntent.mutate(numAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/wallet",
      },
      redirect: "if_required",
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      addFunds.mutate({ 
        amount: parseFloat(amount), 
        paymentIntentId: paymentIntent.id 
      });
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-funds">
      <div>
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.50"
          value={amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="Enter amount"
          data-testid="input-amount"
        />
      </div>

      {clientSecret && (
        <>
          <PaymentElement />
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !stripe || !elements}
            data-testid="button-add-funds"
          >
            {isProcessing ? "Processing..." : `Add $${amount || "0"} to Wallet`}
          </Button>
        </>
      )}
    </form>
  );
}

function AutoReloadSettings({ walletData }: { walletData: WalletData }) {
  const [enabled, setEnabled] = useState(walletData.autoReload.enabled);
  const [threshold, setThreshold] = useState(walletData.autoReload.threshold.toString());
  const [amount, setAmount] = useState(walletData.autoReload.amount.toString());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateAutoReload = useMutation({
    mutationFn: (settings: { enabled: boolean; threshold: number; amount: number }) =>
      apiRequest("PUT", "/api/wallet/auto-reload", settings),
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update auto-reload settings",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateAutoReload.mutate({
      enabled,
      threshold: parseFloat(threshold),
      amount: parseFloat(amount)
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Auto-Reload</Label>
          <p className="text-sm text-muted-foreground">
            Automatically add funds when balance is low
          </p>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={setEnabled}
          data-testid="switch-auto-reload"
        />
      </div>

      {enabled && (
        <>
          <div>
            <Label htmlFor="threshold">Low Balance Threshold (USD)</Label>
            <Input
              id="threshold"
              type="number"
              step="0.01"
              min="0"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="e.g., 10.00"
              data-testid="input-threshold"
            />
          </div>

          <div>
            <Label htmlFor="reload-amount">Auto-Reload Amount (USD)</Label>
            <Input
              id="reload-amount"
              type="number"
              step="0.01"
              min="0.50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g., 50.00"
              data-testid="input-reload-amount"
            />
          </div>
        </>
      )}

      <Button 
        onClick={handleSave} 
        disabled={updateAutoReload.isPending}
        data-testid="button-save-settings"
      >
        {updateAutoReload.isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}

export default function WalletPage() {
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const { toast } = useToast();

  const { data: walletData, isLoading } = useQuery<WalletData>({
    queryKey: ["/api/wallet/balance"],
  });

  const { data: transactionsData } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/wallet/transactions"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-500 rounded-full">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your Berry Events wallet</p>
          </div>
        </div>

        {walletData && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Balance Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" data-testid="text-balance">
                  ${walletData.balance.toFixed(2)}
                </p>
                <p className="text-blue-100">{walletData.currency}</p>
              </CardContent>
            </Card>

            {/* Add Funds Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Funds
                </CardTitle>
                <CardDescription>
                  Top up your wallet with Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" data-testid="button-open-add-funds">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Funds to Wallet</DialogTitle>
                    </DialogHeader>
                    <Elements stripe={stripePromise}>
                      <AddFundsForm onSuccess={() => setAddFundsOpen(false)} />
                    </Elements>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Auto-Reload Status Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Auto-Reload
                </CardTitle>
                <CardDescription>
                  Automatic balance management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span>Status:</span>
                  <Badge 
                    variant={walletData.autoReload.enabled ? "default" : "secondary"}
                    data-testid="badge-auto-reload-status"
                  >
                    {walletData.autoReload.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" data-testid="button-open-settings">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Auto-Reload Settings</DialogTitle>
                    </DialogHeader>
                    <AutoReloadSettings walletData={walletData} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your wallet transaction history
                </CardDescription>
              </div>
              <Dialog open={transactionsOpen} onOpenChange={setTransactionsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-view-all-transactions">
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Transaction History</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-96">
                    {transactionsData?.transactions?.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border-b">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.createdAt), "PPp")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                          </p>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsData?.transactions?.length ? (
              <div className="space-y-4">
                {transactionsData.transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium" data-testid={`text-transaction-desc-${transaction.id}`}>
                        {transaction.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.createdAt), "PPp")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </p>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Separator />
                <p className="text-sm text-muted-foreground text-center">
                  {transactionsData.transactions.length > 5 && 
                    `Showing 5 of ${transactionsData.transactions.length} transactions`
                  }
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions yet</p>
                <p className="text-sm text-gray-400">Your wallet activity will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}