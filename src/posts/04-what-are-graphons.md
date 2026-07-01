---
layout: post.njk
title: "What are graphons?"
date: 2026-06-28
summary: "Graphs are rigid, discrete objects — hard to compare once they have different numbers of vertices. Graphons fix this by turning graphs into continuous functions, and counting subgraphs into integration."
kind: research
status: incomplete
updated: 2026-06-29
tags: [posts, research, graphons, extremal combinatorics, probability]
---

## When are two networks structurally alike?

Suppose you're a data scientist studying the social networks of different countries, and you want to quantify the differences in their broad structure. Maybe the network of one country is a patchwork of small, tight-knit communities with sparse connections between them. Maybe another country's network is one big, densely interconnected community. How would you actually measure that difference?

<!-->TODO INSERT figure of two different example country social networks over here</-->

The obvious first move is to count: how many people (vertices), how many relationships (edges)? But raw counts don't tell you anything about structure — a country with a tenth the population could have an essentially identical social fabric, just scaled down. So you normalize: what's the *average* number of relationships per person in country A versus country B? This is closer, but it collapses too much information into a single number. A network made of many small, tightly-knit clusters connected by sparse bridges, and a network where everyone is uniformly loosely connected, can have exactly the same average degree while looking nothing alike.

So maybe you go local instead of global: analyze the *motifs*. What fraction of triples of people are mutually connected (triangle density)? What fraction of quadruples are mutually connected (tetrahedron density)? This gets you somewhere — now you're comparing structure, not just size. But it's still not enough. Two networks can agree on triangle density, agree on tetrahedron density, agree on every motif you've thought to check, and still differ in their global structure in ways those finitely many statistics simply don't capture. Closing that gap means checking larger and larger motifs, forever, with no guarantee you ever actually pin the structure down.

This is the problem graphons solve. They give you a single object that simultaneously encodes the density of *every* motif at once, and — just as importantly — a natural notion of distance between two such objects, so two networks with similar structure end up provably close together, not just similar on whichever finite checklist of statistics you happened to compute. In 2006, Lovász and Szegedy introduced graphons as continuous limit objects for sequences of dense graphs, with motivations well beyond this network-comparison problem — convergence, sampling, statistics on huge graphs — but the comparison problem is a clean way to see why you'd want them.

The philosophical move is the same one that gets you from the rational numbers to the real numbers. The rationals have gaps — $\sqrt{2}$ isn't one of them — and filling those gaps with limits gives you a complete, well-behaved space where calculus actually works. Graphons do this for graphs: a sequence of networks that keeps agreeing on more and more motifs, without ever quite settling into a fixed structure, is exactly the graph-theoretic analogue of a Cauchy sequence with no rational limit. Graphons fill that gap, completing the space of finite graphs into a continuous space where every reasonable sequence of dense graphs has a limit, and where the combinatorial act of counting motifs becomes the analytic act of integration.

## Building the object

Go back to the social network problem. A network on $n$ people is, formally, a **simple graph**: a finite vertex set $V$ (the people) together with a set $E$ of unordered pairs of distinct vertices (the relationships) — no self-relationships, no relationship counted twice. The trouble is that $n$ is baked into the object from the start. Country A's network lives on $|V_A|$ vertices, Country B's on $|V_B|$ vertices, and there's no canonical way to even line those vertex sets up against each other, let alone compare them, unless $|V_A| = |V_B|$.

So the fix has to start before you even get to edges: stop indexing vertices by $\{1, \ldots, n\}$ at all. Instead, index every possible vertex by a point in a fixed space that doesn't grow with $n$ — say, the unit interval $[0,1]$. Now "vertex 7 out of 50" and "vertex 7,000 out of 50,000" aren't different kinds of labels in different-sized index sets; they're both just points in $[0,1]$, directly comparable regardless of how many vertices you actually sample.

Once vertices are points $x, y \in [0,1]$, a relationship between them is some function of the pair $(x,y)$. Two things pin down what kind of function. First, relationships are undirected — "$x$ and $y$ are connected" doesn't distinguish $x$ from $y$ — so the function has to be **symmetric**: $W(x,y) = W(y,x)$. Second, real social structure isn't deterministic; whether two essentially-similar people happen to know each other is better modeled as a probability than a hard yes/no. So instead of a 0/1-valued adjacency, let

$$W: [0,1]^2 \to [0,1]$$

be the *probability* that the vertices labeled $x$ and $y$ are connected.

That's the whole idea, and the random graph model falls out of it for free: to generate an $n$-vertex sample from $W$, draw $n$ labels $U_1, \ldots, U_n$ independently and uniformly from $[0,1]$, and connect each pair $i < j$ independently with probability $W(U_i, U_j)$. Call the result $G(n, W)$. This single recipe already contains familiar models as special cases. If $W$ is a constant $p$, every pair connects with the same probability and you recover the Erdős–Rényi random graph $G(n,p)$. If $W$ is a step function — constant on a grid of rectangles — you get the stochastic block model, where vertices fall into a handful of communities and connection probability depends only on which communities the two endpoints belong to.

<!-->Insert simulation here.</-->

This is exactly the $n$-independent object the comparison problem was asking for: $W$ doesn't care how many vertices you sample from it, so two networks of wildly different sizes can now be compared by comparing the $W$'s that plausibly generated them, rather than the raw graphs themselves. (Why this also resolves the motif-counting problem — that $W$ implicitly encodes the density of every motif at once — is the subject of a later section.)

With that picture in mind, the formal definition is almost just bookkeeping:

> **Definition (Graphon).** The space $\mathcal{W}$ of *graphons* is the set of Borel measurable, symmetric functions $W: [0,1]^2 \to [0,1]$ (so $W(x,y) = W(y,x)$), where we identify two functions if they agree almost everywhere.

That last clause — modding out by sets of measure zero — isn't a technicality you can shrug off, because it's actually load-bearing. If $W$ and $W'$ differ only on a measure-zero set, then no randomly sampled pair $(U_i, U_j)$ will ever land in the region where they disagree, with probability 1. So $G(n,W)$ and $G(n, W')$ have *exactly* the same distribution. Two graphons that agree almost everywhere aren't just similar — they're indistinguishable as random graph models, full stop.

### The simplest graphons: step functions

The stochastic block model picture above generalizes into the most important sub-family of graphons, the **multipodal graphons**: step functions on the unit square. Formally, $W$ is multipodal if you can partition $[0,1]$ into finitely many pieces $I_1, \ldots, I_N$ (the "podes") and assign a weight $w_{ij} = w_{ji} \in [0,1]$ to each pair of pieces, so that $W$ equals $w_{ij}$ on the rectangle $I_i \times I_j$.

These are worth dwelling on because they show, very concretely, how a graphon generalizes a finite graph — and how an actual, finite country's network sits inside the same space as the continuous idealized version. Take any simple graph $G$ on $n$ vertices, chop $[0,1]$ into $n$ equal intervals $I_1, \ldots, I_n$, and define a graphon $W_G$ that's $1$ on $I_i \times I_j$ exactly when $\{i,j\}$ is an edge of $G$, and $0$ otherwise. This is the **graphon blowup** of $G$ — sometimes called its checkerboard graphon, because that's literally what it looks like as a picture: a black-and-white grid encoding the adjacency matrix. Every finite graph sits inside the space of graphons this way.


## When are two graphons "the same"?
 
Now for the part that makes graphons genuinely useful rather than just a reformulation: a notion of distance.
 
Here's the intuition first. Two graphons should count as "close" if they assign roughly the same amount of connection mass to every region of the unit square — not just on average, but region by region, no matter how you slice it. That's a stronger requirement than it sounds, and it's worth sitting with before the formula: you're not just comparing two functions pointwise, you're asking whether *every possible chunk* of one looks like the corresponding chunk of the other.
 
That's the **cut norm**. For a graphon $W$, define
 
$$\|W\|_{\square} = \sup_{S,T \subseteq [0,1]} \left| \int_{S \times T} W(x,y)\, dx\, dy \right|$$
 
where the supremum is over measurable subsets $S, T$. This induces the **cut distance** between two graphons: $d_\square(W_1, W_2)$ is the supremum, over all pairs of subsets $S, T$, of how differently $W_1$ and $W_2$ distribute mass onto $S \times T$. Intuitively, two graphons are cut-close if no pair of "label regions" sees a big discrepancy in connection mass between them.
 
But cut distance alone is too sensitive: it can declare two graphons "different" just because they use different labelings, even when they generate the exact same family of random graphs. Think of the finite-graph analogy. Two graphs on the same vertex set are *isomorphic* if relabeling the vertices of one turns it into the other, and any property we actually care about — triangle count, edge density, anything — is invariant under that relabeling. So isomorphic graphs are "the same" for essentially every purpose, even though they're literally different objects on paper.
 
The graphon version of relabeling is a **measure-preserving bijection** $\sigma: [0,1] \to [0,1]$ — a way of permuting the label space itself. If $W^\sigma(x,y) := W(\sigma(x), \sigma(y))$, then $W^\sigma$ generates *exactly* the same distribution of random graphs as $W$ does, because relabeling i.i.d. uniform samples with a measure-preserving map just gives you i.i.d. uniform samples again. So $W$ and $W^\sigma$ play the role of isomorphic graphs.
 
This gives the right notion of distance, the **cut metric**:
 
$$\delta_\square(W_1, W_2) = \inf_{\sigma} d_\square(W_1, W_2^\sigma)$$
 
minimizing over every possible relabeling $\sigma$. Where the cut distance compares two graphons under a *fixed* labeling, the cut metric compares them up to relabeling — which is exactly what you want if you're trying to embed actual finite graphs (via their blowups) into this continuous space and compare them meaningfully.
 
Technically, $\delta_\square$ ends up being only a *pseudometric* on the space of graphons — distinct graphons can sit at distance zero from each other. Quotienting by that relation gives the space of **reduced graphons** $\widetilde{\mathcal{W}}$, on which $\delta_\square$ is a genuine metric, and where "graphon" really means "graphon up to relabeling" from here on, even when I just write $W$.
 
The reason all of this machinery is worth building: $(\widetilde{\mathcal{W}}, \delta_\square)$ is a **compact** metric space — a theorem of Lovász and Szegedy. Compactness is what makes graphons useful as limit objects rather than just an alternative encoding: every sequence of graphons has a convergent subsequence, which is exactly the kind of completeness you want from something playing the role of "the real numbers" for graphs.
 
And the limiting story closes the loop: for any graphon $W$, if you sample $G(n, W)$ and take its graphon blowup, that blowup converges to $W$ in cut metric almost surely as $n \to \infty$. So graphons are doing double duty — they parametrize random graph models, *and* they are the limits of the dense graph sequences those models produce. From here on, "graphon" really means an equivalence class in $\widetilde{\mathcal{W}}$, even when I just write $W$.

## Counting subgraphs by integrating

Go back to the motif problem from the introduction. Checking triangle density, then tetrahedron density, then five-cycle density, one statistic at a time, never quite settles whether two networks are structurally alike — there's always a larger motif left unchecked. What you actually want is a single object that hands you the density of *any* motif, on demand, from one formula. That object is the **homomorphism density**, and it's where the graphon machinery built so far finally pays off.

First, the finite-graph version, so the graphon version doesn't appear out of nowhere. A homomorphism from $G$ to $H$ is a map of vertices that sends edges to edges (it doesn't need to be injective). The homomorphism density $t(G, H)$ is the fraction of all functions $V(G) \to V(H)$ that happen to be homomorphisms — equivalently, the probability that a uniformly random map is one. This is the precise version of the fuzzy thing "motif density" meant in the introduction: triangle density is $t(K_3, \cdot)$, tetrahedron density is $t(K_4, \cdot)$, and in general the density of motif $G$ is just $t(G, \cdot)$.

The graphon analogue replaces "count and divide" with "integrate": for a graph $G$ on $k$ vertices and a graphon $W$,

$$t(G, W) := \int_{[0,1]^k} \prod_{\{i,j\} \in E(G)} W(x_i, x_j)\, dx_1 \cdots dx_k$$

Two special cases come up constantly. The **edge density** is $e(W) = \int_{[0,1]^2} W(x,y)\,dx\,dy$, and the **triangle density** is

$$t(W) := t(K_3, W) = \int_{[0,1]^3} W(x,y)\,W(y,z)\,W(x,z)\, dx\, dy\, dz$$

These have a clean probabilistic meaning: $t(G, W)$ is the limiting probability that a fixed map from $V(G)$ lands inside $G(n, W)$ as a homomorphism, as $n \to \infty$. In particular $e(W)$ and $t(W)$ are just the edge and triangle probabilities of the corresponding random graph model. And reassuringly, this all agrees with the finite picture: if $W_H$ is the graphon blowup of a graph $H$, then $t(G, H) = t(G, W_H)$ — homomorphism density of finite graphs is a special case of the graphon version, not a different thing wearing the same name.

Two theorems justify treating $\widetilde{\mathcal{W}}$ as the right home for these questions, and both connect directly back to the introduction's complaint about motifs.

- **Continuity.** For every graph $G$, the map $W \mapsto t(G, W)$ is continuous on $\widetilde{\mathcal{W}}$. This is what ties homomorphism densities to the cut metric from the previous section: graphons that are close in $\delta_\square$ are automatically close in *every* motif density at once, not just the ones you happened to check.
- **Injectivity.** The map sending $W$ to the entire tuple of its homomorphism densities $(t(G,W))_{G}$ is injective — a graphon is completely determined by its homomorphism densities, taken all together over every finite $G$.

It's worth being precise about what injectivity does and doesn't buy you. It does **not** say that finitely many motif checks ever suffice to tell two graphons apart — it's entirely possible for two distinct graphons to agree on triangle density, tetrahedron density, and every motif up to some enormous size, and still differ. What injectivity rules out is something narrower but still important: no structural information is *permanently invisible* to the motif densities. There's no extra hidden feature of a graphon that homomorphism densities, taken all together, fail to see — if two graphons differ at all, some motif, possibly a very large one, will eventually show the difference. Combined with continuity, this is what makes $\widetilde{\mathcal{W}}$ the right home for the comparison problem the introduction posed: not a shortcut around checking infinitely many motifs, but a guarantee that the motif densities, as a complete collection, really do carry the full structural story.


## The Razborov triangle
 
Here's where the machinery pays off on a concrete question. Fix the edge density $e(W) = \epsilon$ of a graphon. What triangle densities $t(W)$ are achievable?
 
Plot every achievable pair $(e(W), t(W))$ as $W$ ranges over all graphons, and you get a region in $[0,1]^2$ called the **Razborov triangle**, after Alexander Razborov, who found the minimum achievable triangle density for each edge density in a 2008 paper.
 
The maximum is the easy direction:
 
> **Theorem (Maximum triangle density).** For a graphon $W$ with edge density $\epsilon$, $t(W) \leq \epsilon^{3/2}$, with equality uniquely at $W = \mathbb{1}_{[0,\sqrt{\epsilon}]^2}$ — a single dense block.
 
The minimum is where it gets interesting, and it comes in pieces. For $\epsilon \leq 1/2$, you can actually drive the triangle density all the way down to zero — achieved by a complete bipartite-style graphon (split $[0,1]$ in half and connect across, never within). Any edge density up to $1/2$ is reachable by a triangle-free graphon, so the lower boundary of $\mathcal{R}$ just sits on the axis for that whole stretch.
 
Past $\epsilon = 1/2$ it's no longer possible to avoid triangles entirely, and the exact minimum — proven by Razborov using a technique called *flag algebras*, which is in a precise sense dual to the graphon picture via the injectivity theorem above — has a genuinely ugly closed form involving square roots and a parameter $k$ that increases as $\epsilon$ climbs. The extremal construction has a nice shape, though: partition $[0,1]$ into $k$ intervals, make every cross-pair of intervals fully connected, make all but one of the intervals internally triangle-free, and let the leftover interval absorb whatever edge density is needed without contributing extra triangles. The strategy — exhaust your triangle "budget" in one localized region, and let the rest of the graphon pad out the edge density for free — is a recurring trick.
 
Put the maximum, the $\epsilon \leq 1/2$ minimum, and the Razborov minimum together, and you get the full shape of $\mathcal{R}$: a region bounded above by a smooth curve and below by a curve that's flat near the origin and then breaks into infinitely many pieces, one for each integer $k$, getting smoother as $\epsilon \to 1$.
 
## Where this is going
 
The Razborov triangle is built around a tension between two graphs: a fixed edge density $\epsilon$ caps how many triangles a graphon can pack in, and the question is how tight that cap actually is. Nothing about that tension is special to triangles. Replace "triangle" with any graph $G$, and ask the analogous question: among graphons with edge density $e(W) = \epsilon$ and triangle density $t(W) \leq \tau$, how large can $t(G, W)$ get?
 
The next post picks up exactly there, in the limiting regime $\tau \to 0$ — the graphon analogue of "almost triangle-free." It turns out the corner of the Razborov triangle near $\epsilon \leq 1/2$, where triangle density can be driven to zero outright, is the right place to start, and the extremal constructions look a lot like the localized, budget-exhausting graphons that show up in the minimum-triangle-density theorems above.
 
I'll link that post here once it's up.
 
---
 
## TODO
 
**THIS POST IS NOT DONE.** Still need:
 
- [ ] **Graphon sampling demo** — interactive widget letting the reader pick/draw a graphon $W$ (constant, step-function, smooth) and sample $G(n, W)$ for increasing $n$, placed after the $W$-random graph construction.
- [ ] **Cut norm / cut distance demo** — draggable region $S \times T$ over a heatmap of $W$, live-updating the integral, tracking the running sup. Possibly extend to two graphons side by side for $d_\square(W_1, W_2)$.
- [ ] **Relabeling / shuffle demo** — button to apply a random measure-preserving $\sigma$ to a graphon heatmap, showing how scrambled it looks while still being "the same" graphon under $\delta_\square$.
- [ ] **Checkerboard graphon figure** — static side-by-side of a small graph's adjacency matrix next to its graphon blowup heatmap.
- [ ] Re-add real citations/links for Lovász–Szegedy, Razborov, Pikhurko et al. (currently stripped from the thesis bib keys).
- [ ] Link this post forward once the $\tau \to 0$ post is published.
 

