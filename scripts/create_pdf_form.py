from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_pdf_form():
    c = canvas.Canvas("tests/assets/form_template.pdf", pagesize=letter)

    # We use reportlab's acroform features
    form = c.acroForm

    c.drawString(100, 700, "First Name:")
    form.textfield(name='FirstName', tooltip='First Name',
                   x=200, y=695, width=200, height=20)

    c.drawString(100, 670, "Last Name:")
    form.textfield(name='LastName', tooltip='Last Name',
                   x=200, y=665, width=200, height=20)

    c.drawString(100, 640, "Date of Birth:")
    form.textfield(name='DOB', tooltip='Date of Birth',
                   x=200, y=635, width=200, height=20)

    c.drawString(100, 610, "Nationality:")
    form.textfield(name='Nationality', tooltip='Nationality',
                   x=200, y=605, width=200, height=20)

    c.drawString(100, 580, "Passport Number:")
    form.textfield(name='PassportNumber', tooltip='Passport Number',
                   x=200, y=575, width=200, height=20)

    c.save()
    print("PDF form template created at tests/assets/form_template.pdf")

if __name__ == "__main__":
    create_pdf_form()
