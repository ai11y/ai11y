# JEV token optimization metrics

Measured with the same synthetic 28-marker page and the instruction
`click save`. The fixture approximates the demo mix of content markers, buttons,
routes, inputs, and a custom select. Token counts use the common
`serialized characters / 4` estimate; provider billing may tokenize differently.

| Metric                                   |      Before |     After | Change |
| ---------------------------------------- | ----------: | --------: | -----: |
| Choice options                           |          74 |         7 | -90.5% |
| Serialized request                       | 8,609 bytes | 753 bytes | -91.3% |
| Estimated input tokens per planning call |       2,153 |       189 | -91.2% |
| Planning calls for a terminal action     |           2 |         1 |   -50% |

The optimized request contains five shortlisted action candidates plus
`completed` and `needs_input`. It no longer duplicates the full marker catalog
in JEV state. Every generated UI action candidate is terminal, so the client
does not make a second request merely to ask whether the completed action was
enough.

These are payload-shape metrics, not provider invoices. Actual usage should be
sampled from the SDK response in production because tokenization and cache or
pricing behavior are provider-controlled.
