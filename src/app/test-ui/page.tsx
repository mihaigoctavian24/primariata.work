"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TestUIPage() {
  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">shadcn/ui Component Test Page</h1>
          <p className="text-muted-foreground">
            Testing all installed components with tweakcn theme
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Separator />

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons (with Ripple Effect)</CardTitle>
          <CardDescription>
            All buttons now have Material Design ripple, tap and hover animations
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🎨</Button>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Badge variants</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </CardContent>
      </Card>

      {/* Form Elements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Inputs, selects, and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="email@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="select">Select Option</Label>
            <Select>
              <SelectTrigger id="select">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dialog</CardTitle>
          <CardDescription>Modal dialog example</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog Title</DialogTitle>
                <DialogDescription>
                  This is a dialog description. You can put any content here.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Dropdown Menu Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dropdown Menu</CardTitle>
          <CardDescription>Context menu example</CardDescription>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Open Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Toast Section */}
      <Card>
        <CardHeader>
          <CardTitle>Toast (Sonner)</CardTitle>
          <CardDescription>Notification toast examples</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={() => toast("Default toast message")}>Default Toast</Button>
          <Button
            onClick={() => toast.success("Operation completed successfully!")}
            variant="secondary"
          >
            Success Toast
          </Button>
          <Button onClick={() => toast.error("Something went wrong!")} variant="destructive">
            Error Toast
          </Button>
        </CardContent>
      </Card>

      {/* Theme Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Colors</CardTitle>
          <CardDescription>Testing tweakcn custom theme colors</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <div className="bg-primary h-20 rounded-md" />
            <p className="text-center text-sm">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="bg-secondary h-20 rounded-md" />
            <p className="text-center text-sm">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="bg-accent h-20 rounded-md" />
            <p className="text-center text-sm">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="bg-muted h-20 rounded-md" />
            <p className="text-center text-sm">Muted</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
