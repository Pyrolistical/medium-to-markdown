Don’t let this one problem ruin your user’s experience
======================================================

Building great online experiences is hard and it is due to the one critical limitation that system designers fear the most, latency.

The latency for a request from San Francisco to New York City compared to a CPU cycle is [eight orders of magnitude](https://blog.codinghorror.com/the-infinite-space-between-words/)!

This difference in latency causes a mismatch in our mental models. When we run code locally, it appears to run instantaneously. We have this faulty mental model where code is instantaneous. But that’s not reality. In reality there is a delay but it is too short for us to perceive. With the delay so small, there is also little opportunity for things to go wrong, so almost nothing ever goes wrong except for the bad logic within the code.

Over the Internet however, the delays are front and center. We can feel them every time we navigate to a new page. During these delays is where all the trouble is found.

Let me illustrate this problem with the classic banking example of Alice transfering money to Bob.

![](https://miro.medium.com/max/1400/1*mBNhZYes8oPKhkIyWERKnA.png)Network architecture

For this problem we’ll focus on Alice’s user experience and won’t bother ourselves with the implementation details.

The happy path is straight forward.

![](https://miro.medium.com/max/1400/1*7o29tkPr6_-1sUKg9Y-cEw.png)

But remember this is an online application and we have to consider latency problems. The most common latency problem is when it goes to infinity, or in other words there is no longer a network connection. If the network goes down before Alice requests the transfer, that’s easy to handle, just show an error. But if the network goes down after Alice requests a transfer, what should happen?

Here be dragons. What should happen depends on whether the _bank_ received the transfer request or not.

First let’s cover the scenario where the network failure cause the transfer request to be lost, he bank never received it. Alice still sees her balance is 100 and sees no record of the transfer.

![](https://miro.medium.com/max/1400/1*6IBn4DU3HylWQCR9CGxjdA.png)

How would Alice react in this situation? What would she believe? She would be very concerned. She believes she submitted the request but nothing happened. Alice has no choice but to attempt the transfer again and hope this doesn’t result in a double transfer (more on this later).

As system designers what can we do in this scenario for Alice? Unfortunately there is nothing we can do. From our system’s point of view, nothing has even happened.

What about the client side? Could we add a loading screen client side so at least Alice can see the client has reacted to her request? Yes this is a great user experience technique, but this doesn’t solve the entire issue. What if Alice was on battery power and her computer turns off just after she submits the transfer request? She ends up in the same place. There will always be a sliver of this issue we can never resolve.

But let’s add a loading screen. This will improve the user experience and also make the latency problem more visible. Once we implement a loading screen we are forced to answer the question, what if the network fails while the loading screen is up?

We already know how to handle the case where the request was never received by the bank. Do nothing. Alice will resubmit.

Another easy case is if the the bank did receive the transfer request, but the network failed before response made it back to Alice’s computer. When Alice reloads the page she’ll see her updated balanced and a record of the successful transfer.

But what if the network is really slow? What if the network hasn’t failed, the requested transfer is just taking the scenic route? If Alice reloads the page but the transfer is still inflight, she won’t know this. Alice will see her balance is still at 100. There will be no record of the requested transfer as the bank hasn’t received it yet, but will eventually.

![](https://miro.medium.com/max/1400/1*7DOJUHjTfybMo-j0LcJBaA.png)

This is a very tricky problem to solve, as from Alice’s point of view this is indistinguishable from her never making the transfer request.

We already know what Alice would do in this case, she will resubmit the transfer request. You may be shouting at the screen, “Nooooo don’t do it!”, as in most system this will lead to a double transfer.

This is why building online experiences is hard. These latency gaps are everywhere and so many uncomfortable problems crop up.

What shall we do? Give up and switch careers to building offline single player game. Screw this network stuff! But before you open that Godot tutorial, let me show you how we can solve this problem.

This problem is intractable if we attempt to come up with a technical solution. What we need to realize is this is a business problem and it needs a business solution. A conversation with a business analyst might go something like:

> System designer: Hey, how should we handle the case where an user requests the same transfer twice?

Business analyst: What do you mean same? The same amount? The same from and to accounts?

> System designer: Yeah and even within a very short amount of time.

Business analyst: Short? How short like in less than 24 hours? Those are almost always mistakes. We should detect duplicate transfer requests and reject them.

> System designer: 24 hours? Well that makes my job easier. I was thinking in terms of seconds…

Armed with these new requirements, we can now offer Alice a great user experience.

![](https://miro.medium.com/max/1400/1*yhxqsgc5Z7eWYHr-TGzJSg.png)

These latency gaps are everywhere. For every single network request consider the user experience impact when:

1.  What should you do when the request is dropped?
2.  What should you do when the response is dropped?
3.  What should you do when the request/response is just slow?

Get into the head of your users and we can build great online experiences. This isn’t easy, but that’s our jam.

Do you want to build great user experiences? [**You’re in luck, Battlefy is hiring**](https://apply.workable.com/battlefy/).
