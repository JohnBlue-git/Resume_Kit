# make setup                 one-time: Python deps, Chromium for PDF, pptxgenjs for the deck
# make resume                every target in targets/  -> out/resume/
# make resume TARGET=bmc     one target
# make deck                  interview deck -> out/deck/ (.pptx .pdf .html)
# make qa                    deck HTML smoke test
# make ats PDF=file.pdf      what an ATS reads from any PDF
PY ?= python3

.PHONY: all setup resume deck qa ats clean
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

clean:
	rm -rf out
