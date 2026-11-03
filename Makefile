# make setup                 one-time: Python deps, Chromium for PDF, pptxgenjs for the deck
# make resume                every target in targets/  -> out/resume/
# make resume TARGET=bmc     one target
# make deck                  interview deck -> out/deck/ (.pptx .pdf .html)
# make qa                    deck HTML smoke test
# make ats PDF=file.pdf      what an ATS reads from any PDF
# make validate             structural checks on content/ and targets/
# make sync                  collect GitHub repo changes -> out/github/report.md
# make match JD=jd.txt       compare a job description with content and built resumes
PY ?= python3

.PHONY: all setup resume deck qa ats validate sync match clean
all: resume deck

setup:
	$(PY) -m pip install -r requirements.txt
	$(PY) -m playwright install chromium
	cd deck && npm install --no-audit --no-fund

resume:
	$(PY) resume/build.py $(TARGET)

deck:
	bash deck/build.sh

qa:
	$(PY) deck/src/qa_interact.py out/deck/Yujen_Lan_Interview_Deck.html

ats:
	$(PY) tools/ats_check.py $(PDF)

validate:
	$(PY) resume/validate.py

sync:
	$(PY) tools/github_sync.py

match:
	$(PY) tools/jd_match.py $(JD)

clean:
	rm -rf out
