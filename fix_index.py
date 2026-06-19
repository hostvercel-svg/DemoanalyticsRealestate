import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Fix 1: Restore the modal HTML and start of listings
broken_start = '            <div id="m-eng-sub" style="fonconst listings = [\n    {\n        urduTitle:"۱۲۰ گز رہائشی پلاٹ",'

fixed_start = '''            <div id="m-eng-sub" style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;"></div>
        </div>
        <div class="modal-body">
            <div style="background:#f0f7f3;border:2px solid #1B4D2E;padding:14px 18px;margin-bottom:16px;text-align:center;">
                <div style="font-family:serif;font-size:26px;font-weight:700;color:#1B4D2E;direction:rtl;line-height:1.8;" id="m-urdu-price"></div>
                <div style="font-size:13px;color:#666;margin-top:4px;" id="m-price"></div>
            </div>
            <div id="m-specs" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;direction:rtl;"></div>
            <div id="m-desc" style="background:#f9f9f7;border-right:4px solid #C9A84C;padding:12px 14px;margin-bottom:16px;font-family:serif;font-size:15px;direction:rtl;line-height:2.4;color:#333;text-align:right;"></div>
            <div class="modal-actions">
                <a class="modal-wa" id="m-wa" href="#" target="_blank"><i class="fab fa-whatsapp"></i> Mr. Ahmed — واٹس ایپ</a>
                <a class="modal-call" href="tel:+923205992687"><i class="fas fa-phone"></i> ابھی کال کریں</a>
            </div>
        </div>
    </div>
</div>

<script>
const listings = [
    {
        urduTitle:"۱۲۰ گز رہائشی پلاٹ",'''

if broken_start in content:
    content = content.replace(broken_start, fixed_start)
    print("Fixed start of modal")
else:
    print("Broken start not found")

# Fix 2: Remove the garbled duplicate listings at the end
# The garble starts right after the block for "400 Sq Yd Main Boulevard Block E"
# which ends with:
#        wa:"400%20Sq%20Yd%20Main%20Boulevard%20Block%20E%20-%20Mujhe%20dilchaspi%20hai"
#    }
# ];    ["رقبہ", ...
# and continues until `];\n\n// HERO SLIDER`

# We can use regex to find this garbled block
pattern = re.compile(r'(wa:"400%20Sq%20Yd%20Main%20Boulevard%20Block%20E%20-%20Mujhe%20dilchaspi%20hai"\s*\}\s*)\];.*?\];\s*// HERO SLIDER', re.DOTALL)
match = pattern.search(content)

if match:
    # Replace it with just closing the array and the hero slider comment
    fixed_end = match.group(1) + '];\n\n// HERO SLIDER'
    content = content.replace(match.group(0), fixed_end)
    print("Fixed garbled end")
else:
    print("Garbled end not found")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
