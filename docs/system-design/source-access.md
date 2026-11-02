---
title: PDF source access audit
sidebar_position: 6
description: Bounded public PDF access and extraction results, separate from semantic review of the learning guides.
---

# PDF source access audit

**Checked 2026-11-01.** Snapshot of the notes URLs in the four system-design catalog JSON datasets: **43 topics, 37 distinct Drive file IDs**. This supplements the [source library and detailed review scope](sources.mdx); it does not replace them.

## Access and extraction, not guide verification

- **30 new downloads succeeded; 7 previously downloaded PDFs reused; 0 download failures, denials, timeouts, or unattempted IDs.** Existing PDFs were checked locally, not fetched again.
- **37/37 PDFs passed the PDF-header check and parsed with the existing TEMP-installed pypdf.** Text extraction completed without exceptions across **242 pages**; **240 pages yielded non-whitespace text**. Empty text is not proof of an empty page. No OCR was performed.
- Only the public `https://drive.usercontent.google.com/download?id=ID&export=download` endpoint was requested, once per missing ID: built-in urllib, 20-second request timeout plus a 20-second worker-process cap, at most four concurrent requests, and a 175-second global network budget. No credentials, authentication, or denied-request retries were used.
- Extraction was interrupted once after downloads had completed, then restarted successfully from cached files with **no further network requests**. The resumed manifest's network timing measures only that cache-only invocation, not the original download duration.
- PDFs, page-delimited text extracts, hashes, byte counts, and the machine-readable manifest remain in the local TEMP research area: the existing `lld-research-20261101-005215` directory and its `access-20261101` subdirectory. **No PDFs or extracted source text were copied into the site.** Access is a point-in-time result, not a future availability guarantee.

**Semantic review boundary:** all 30 new extracts had their opening 700-character samples inspected. Only **MVC, Adapter, and Proxy** additionally had their complete extracted text read in this pass; scoped observations appear below. The other **27 new PDFs received opening-sample inspection only**, not full semantic review. The seven reused PDFs retain their prior review scope in the source library; their text was re-extracted, not newly re-reviewed here. **No PDF diagrams, images, layouts, videos, or linked code were visually verified or executed in this pass.** Successful extraction does not establish accuracy or completeness, and these checks do not audit the guides against all PDFs. Existing “PDF not reviewed” guide/metadata labels deliberately remain unchanged.

## Per-source results

**New** = downloaded successfully in this pass (HTTP 200); **Reused** = existing local PDF, no new access request. **OK x/y** = extraction attempted successfully on all y pages, with non-whitespace text on x pages; this does not certify that every visual element was extracted. Multiple notes for one topic remain separate rows and distinct IDs remain separate files.

| Topic | Original notes URL | Download | Pages | Text extraction |
| --- | --- | --- | ---: | --- |
| SOLID — single responsibility | [SRP PDF](https://drive.google.com/file/d/1p7W4QghiwQOdu_Mx4TjzAbqy78gFY64j/view?usp=drive_link) | Reused | 4 | OK 4/4 |
| SOLID — open/closed | [OCP PDF](https://drive.google.com/file/d/1zniJ2vzjHIhuY4uK8rP-o4mZCYQzo-PU/view?usp=drive_link) | Reused | 3 | OK 3/3 |
| SOLID — Liskov substitution | [LSP PDF](https://drive.google.com/file/d/1p9n3In8Zfc-FIQe2V3zFJs0iCW88DNET/view?usp=drive_link) | Reused | 6 | OK 6/6 |
| SOLID — interface segregation | [ISP PDF](https://drive.google.com/file/d/1vitVuk7CedTL_xQ4aUTh4HlEaDi6IsTS/view?usp=drive_link) | Reused | 4 | OK 3/4; one page has no extracted text |
| SOLID — dependency inversion | [DIP PDF](https://drive.google.com/file/d/1oIRML-gBFcYI7LYuWFZq52JFV1AQc2ga/view?usp=drive_link) | Reused | 5 | OK 5/5 |
| Model–View–Controller (MVC) | [MVC PDF](https://drive.google.com/file/d/1oKEaL_-2SnfeRIJUDzX7WNEOtqqcMTJ0/view?usp=drive_link) | New | 6 | OK 6/6 |
| Factory Method | [PDF](https://drive.google.com/file/d/1nsb2UJ1y8YTYSCllNDu7xx-YuxfRRUAg/view?usp=drive_link) | New | 5 | OK 5/5 |
| Abstract Factory | [PDF](https://drive.google.com/file/d/1iyouXyHYdbhTyptjN17oqFW8RmGKTQ87/view?usp=drive_link) | New | 5 | OK 5/5 |
| Builder | [PDF](https://drive.google.com/file/d/1V5qnfvYpNiEzb3bu9221HMD8QDaTkVC9/view?usp=drive_link) | New | 7 | OK 7/7 |
| Singleton | [PDF](https://drive.google.com/file/d/1P_ptiVovd0ERLtMqVbgJVd9r5mYme-k_/view?usp=drive_link) | New | 8 | OK 8/8 |
| Object Pool | [PDF](https://drive.google.com/file/d/1NymzCEjJq7c_w1XQrjpt77xk-M1KrvWo/view?usp=drive_link) | New | 6 | OK 6/6 |
| Decorator | [PDF](https://drive.google.com/file/d/19W73JBOtOtOzIHmKBA-4ACqCXwv60pB0/view?usp=drive_link) | New | 7 | OK 7/7 |
| Proxy | [PDF](https://drive.google.com/file/d/1S0fRkyGAmhGupC02Xqi6YEfMmeaBxi_K/view?usp=drive_link) | New | 3 | OK 3/3 |
| Composite: file system | [PDF](https://drive.google.com/file/d/1FIBgNSJY-YkZYJO7WIKsY_io6tVIBkCa/view?usp=drive_link) | New | 6 | OK 6/6 |
| Adapter | [PDF](https://drive.google.com/file/d/1BKx6HITzyw-c1RjX4372aH_L4b1-5S1w/view?usp=drive_link) | New | 4 | OK 4/4 |
| Facade | [PDF](https://drive.google.com/file/d/1YpWHwZmOFIlFd-ftign3jtZWhOWEjwy0/view?usp=drive_link) | New | 6 | OK 6/6 |
| Bridge | [PDF](https://drive.google.com/file/d/1byU7bYbjdkhIFU2je3Ck8IqjrFZvrRkr/view?usp=drive_link) | New | 5 | OK 5/5 |
| Flyweight: word processor | [PDF](https://drive.google.com/file/d/1oCmas08vpcpiEMqYkIYEvjkNWIQ9lDGm/view?usp=drive_link) | New | 8 | OK 8/8 |
| Strategy | [PDF](https://drive.google.com/file/d/1smTeCvuc9aQwZS7gd-vxPs75wezuYAFp/view?usp=drive_link) | Reused | 7 | OK 7/7 |
| Observer | [PDF](https://drive.google.com/file/d/1l3T-TsuhWyQx8us5lxeh-bt4KR_8tr9w/view?usp=drive_link) | New | 9 | OK 9/9 |
| Chain of Responsibility | [PDF](https://drive.google.com/file/d/1niWAA5Vy3gC8i6xU96igcYVR_ygZmboT/view?usp=drive_link) | New | 5 | OK 5/5 |
| Null Object | [PDF](https://drive.google.com/file/d/1LUQFI4vDRn6mAsgmDMVCO4lmOXX50dDc/view?usp=drive_link) | New | 7 | OK 7/7 |
| Command: undo and redo | [PDF](https://drive.google.com/file/d/183IjgJ6pQDHswDQiwWMazetTpdK6SWaV/view?usp=drive_link) | New | 6 | OK 6/6 |
| Iterator | [PDF](https://drive.google.com/file/d/1-AR6mJkZydatqHIxA58EreRzDt33_MqQ/view?usp=drive_link) | New | 7 | OK 7/7 |
| Mediator | [PDF](https://drive.google.com/file/d/1SVx1ZYrJ_nqdHQ6Uq390wSt1TMX5vPOU/view?usp=drive_link) | New | 6 | OK 5/6; one page has no extracted text |
| Visitor | [PDF](https://drive.google.com/file/d/1vX_USKxmI-wqOwsV3tMD4OGj6a-usJdn/view?usp=drive_link) | New | 8 | OK 8/8 |
| Memento | [PDF](https://drive.google.com/file/d/1hc0cbjPKURcsvlMMkfMsq4yFXisS9Z2b/view?usp=drive_link) | New | 5 | OK 5/5 |
| Template Method | [PDF](https://drive.google.com/file/d/15qaWbbBxXeZD3uC_7jfVHwPZxxiAm-jV/view?usp=drive_link) | New | 4 | OK 4/4 |
| Interpreter | [PDF](https://drive.google.com/file/d/1jnzOCqy1ICoPkI0d-N9HolZacVtlbeJD/view?usp=drive_link) | New | 4 | OK 4/4 |
| Parking Lot | [PDF](https://drive.google.com/file/d/1aE9QhlRZgtUDI-p_2NiPdVWaq3eP-Mn7/view?usp=drive_link) | Reused | 6 | OK 6/6 |
| Tic Tac Toe | [PDF](https://drive.google.com/file/d/1JgTipI2hutFrd3YxDpE8L2KukIr0VC7H/view?usp=drive_link) | New | 5 | OK 5/5 |
| Elevator | [PDF](https://drive.google.com/file/d/1MGudMSiJj2JMC75qq3o34gW2Kz-UAYPl/view?usp=drive_link) | New | 13 | OK 13/13 |
| Car Rental | [PDF 1](https://drive.google.com/file/d/1QR51mRs_1cM7Cq5aDlPLKAvrjHMtLiU0/view?usp=drive_link) | New | 11 | OK 11/11 |
| Car Rental | [PDF 2](https://drive.google.com/file/d/11UNsQAciYNTr1iDkkR_H9hJ5lj4A4kr4/view?usp=drive_link) | New | 11 | OK 11/11 |
| Snake and Ladder | [PDF](https://drive.google.com/file/d/1cGyGGWOrp_b4Jm2xHFlI_FitPivDHgiN/view?usp=drive_link) | New | 5 | OK 5/5 |
| BookMyShow | [PDF](https://drive.google.com/file/d/1XbWo8m1hOOdKGww0UO1x3zIskdQjqf2i/view?usp=drive_link) | New | 13 | OK 13/13 |
| Vending Machine | [PDF](https://drive.google.com/file/d/1FDEdh2xhvlZpftC_392pml9h2lcl_q3A/view?usp=drive_link) | New | 12 | OK 12/12 |

### Topics without a supplied Drive PDF

These are **not download failures**. Repository URLs are outside this PDF-only audit; the source library retains them. No additional PDFs were inferred from collection folders or related lessons.

| Topic | Notes URL in topic metadata | Download / pages / extraction |
| --- | --- | --- |
| Design a HashMap | No notes URL; code links only | Not applicable |
| Prototype (supplemental) | No notes URL; code link only | Not applicable |
| State: vending machine and ATM (supplemental) | No notes URL; code link only | Not applicable |
| ATM | No notes URL; code links only | Not applicable |
| Chess | No notes URL; code links only | Not applicable |
| Splitwise | No notes URL; code links only | Not applicable |
| Cricbuzz | No notes URL; code links only | Not applicable |
| Inventory Management | No notes URL; code link only | Not applicable |
| Shopping Cart Coupons | No notes URL; code links only | Not applicable |
| Payment Gateway | [Supplied Zoho notes](https://notebook.zohopublic.in/public/notes/bietv6993f5a023ec4e9f89436149ac3ed2f7) | Not attempted: non-PDF notes, outside scope |
| Meeting Scheduler | No notes URL; code links only | Not applicable |

## Limited original reading observations

These observations refer only to the **complete extracted text** of the three named PDFs, not visual inspection or compilation of their examples. Page numbers refer to the PDF pages, not site pages. They do not change guide review labels.

- **MVC, pages 2–5:** the narrative describes model-driven view updates, but the blog example explicitly asks the controller to display results after mutations. It is useful to distinguish that console orchestration from an implemented model-to-view notification mechanism; the extracted example does not demonstrate the latter.
- **Adapter, page 3:** the weight-conversion comment gives a pounds-to-kilograms factor of 0.453592, while the implementation multiplies by 0.45. This illustrates why interface adaptation and numerical precision need separate checks; the example should not be treated as an exact conversion reference.
- **Proxy, pages 2–3:** the example distinguishes read access for USER/ADMIN from creation restricted to ADMIN. Its extracted client invokes `getEmployeeInfo()` without an argument although the interface requires an integer ID. This is a static text inconsistency, not a reported compiler result; no Java was executed.

No additional semantic findings are claimed for the opening-only samples. Public availability is not permission to republish the source PDFs.