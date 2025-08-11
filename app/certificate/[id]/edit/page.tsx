import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { hasPermission } from "@/lib/auth"
import { notFound } from "next/navigation"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCertificatePage({ params }: EditPageProps) {
  const resolvedParams = await params;
  const certificateId = resolvedParams.id;
  
  const canEdit = await hasPermission("write", "certificates")

  if (!canEdit) {
    redirect("/certificate")
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      category: true,
    },
  })

  if (!certificate) {
    notFound()
  }

  const categories = await prisma.certificateCategory.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  })

  async function updateCertificate(formData: FormData) {
    "use server"

    const user = await getUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const categoryId = formData.get("categoryId") as string
    const version = formData.get("version") as string
    const issueDate = formData.get("issueDate") as string
    const location = formData.get("location") as string
    const content = formData.get("content") as string
    const highlighted = formData.has("highlighted")
    const approved = formData.has("approved")

    if (!title || !categoryId || !version || !issueDate || !location) {
      throw new Error("All fields are required")
    }

    await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        title,
        categoryId,
        version,
        issueDate: new Date(issueDate),
        location,
        content,
        highlighted,
        approved,
        updatedById: user.id as string,
      },
    })

    redirect(`/certificate/${certificateId}`)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={`/certificate/${certificateId}`} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificate
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Certificate</CardTitle>
          <CardDescription>Update certificate details</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCertificate} className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="title"
                name="title"
                className="w-full p-2 border rounded"
                defaultValue={certificate.title}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className="w-full p-2 border rounded"
                defaultValue={certificate.categoryId}
                required
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="version" className="text-sm font-medium">
                Version
              </label>
              <input
                id="version"
                name="version"
                className="w-full p-2 border rounded"
                defaultValue={certificate.version}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="issueDate" className="text-sm font-medium">
                Issue Date
              </label>
              <input
                id="issueDate"
                name="issueDate"
                type="date"
                className="w-full p-2 border rounded"
                defaultValue={new Date(certificate.issueDate).toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <input
                id="location"
                name="location"
                className="w-full p-2 border rounded"
                defaultValue={certificate.location}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={5}
                className="w-full p-2 border rounded"
                defaultValue={certificate.content || ""}
                placeholder="Enter certificate content or description..."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="highlighted"
                name="highlighted"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={certificate.highlighted}
              />
              <label htmlFor="highlighted" className="text-sm font-medium">
                Highlight this certificate
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                id="approved"
                name="approved"
                type="checkbox"
                className="w-4 h-4"
                defaultChecked={certificate.approved}
              />
              <label htmlFor="approved" className="text-sm font-medium">
                Mark as approved
              </label>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Update Certificate</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}